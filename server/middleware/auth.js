import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger.js';

// ========== Session Management ==========
const activeSessions = new Map(); // token -> { userId, role, expiresAt }
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (extended for convenience)
let sessionsFilePath = null;
let saveTimeout = null;

// Initialize session file path and load persisted sessions
export const initSessions = async (dataDir) => {
    sessionsFilePath = path.join(dataDir, 'sessions.json');
    try {
        if (await fs.pathExists(sessionsFilePath)) {
            const data = await fs.readJson(sessionsFilePath);
            const now = Date.now();
            let loaded = 0;
            for (const [token, session] of Object.entries(data)) {
                if (session.expiresAt > now) {
                    activeSessions.set(token, session);
                    loaded++;
                }
            }
            if (loaded > 0) logger.info('Loaded persisted sessions', { count: loaded });
        }
    } catch (e) {
        logger.error('Failed to load sessions file', { error: e.message });
    }
};

// Debounced save to disk
const saveSessionsToDisk = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        if (!sessionsFilePath) return;
        try {
            const obj = Object.fromEntries(activeSessions);
            await fs.writeJson(sessionsFilePath, obj, { spaces: 2 });
        } catch (e) {
            logger.error('Failed to persist sessions', { error: e.message });
        }
    }, 500);
};

export const createSession = (userId, role) => {
    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, {
        userId,
        role,
        expiresAt: Date.now() + SESSION_TTL
    });
    saveSessionsToDisk();
    return token;
};

export const deleteSession = (token) => {
    activeSessions.delete(token);
    saveSessionsToDisk();
};

export const getSession = (token) => {
    return activeSessions.get(token) || null;
};

// Clean expired sessions every hour
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [token, session] of activeSessions) {
        if (session.expiresAt < now) {
            activeSessions.delete(token);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        logger.info('Cleaned expired sessions', { count: cleaned });
        saveSessionsToDisk();
    }
}, 60 * 60 * 1000);

// ========== PBKDF2 Password Hashing ==========
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LENGTH = 32;
const SALT_LENGTH = 16;

export const hashPasswordPBKDF2 = async (prehash) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(prehash, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, 'sha256', (err, derivedKey) => {
            if (err) reject(err);
            else resolve(`pbkdf2:${salt}:${derivedKey.toString('hex')}`);
        });
    });
};

export const verifyPasswordPBKDF2 = (prehash, storedHash) => {
    return new Promise((resolve, reject) => {
        if (!storedHash.startsWith('pbkdf2:')) {
            // Legacy SHA256: direct compare, and signal need for migration
            resolve({ match: prehash === storedHash, needsMigration: true });
            return;
        }
        const parts = storedHash.split(':');
        const salt = parts[1];
        const hash = parts[2];
        crypto.pbkdf2(prehash, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, 'sha256', (err, derivedKey) => {
            if (err) reject(err);
            else resolve({ match: derivedKey.toString('hex') === hash, needsMigration: false });
        });
    });
};

// ========== Auth Middleware ==========
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const session = activeSessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
        if (session) activeSessions.delete(token);
        return res.status(401).json({ error: 'Session expired' });
    }

    req.sessionUserId = session.userId;
    req.sessionUserRole = session.role;
    next();
};

// Check that authenticated user can access target userId's data
export const userAccessMiddleware = (req, res, next) => {
    const targetUserId = req.params.userId || req.body?.userId || req.query?.userId;
    if (!targetUserId) return next(); // No target user - generic route
    if (req.sessionUserRole === 'admin' || req.sessionUserId === targetUserId) {
        return next();
    }
    return res.status(403).json({ error: 'Access denied' });
};

export const adminOnly = (req, res, next) => {
    if (req.sessionUserRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
