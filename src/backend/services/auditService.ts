import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const AUDIT_FILE = path.resolve(process.cwd(), 'audit_chain.json');

export interface AuditBlock {
  index: number;
  timestamp: string;
  userId: string;
  action: string;
  resourceId: string;
  details: string;
  previousHash: string;
  hash: string;
}

function calculateHash(index: number, timestamp: string, userId: string, action: string, resourceId: string, details: string, previousHash: string): string {
  return crypto.createHash('sha256').update(index + timestamp + userId + action + resourceId + details + previousHash).digest('hex');
}

export function getAuditChain(): AuditBlock[] {
  if (!fs.existsSync(AUDIT_FILE)) {
    // Create genesis block
    const genesis: AuditBlock = {
      index: 0,
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'INIT',
      resourceId: 'genesis',
      details: 'Genesis Block',
      previousHash: '0',
      hash: ''
    };
    genesis.hash = calculateHash(genesis.index, genesis.timestamp, genesis.userId, genesis.action, genesis.resourceId, genesis.details, genesis.previousHash);
    fs.writeFileSync(AUDIT_FILE, JSON.stringify([genesis], null, 2));
    return [genesis];
  }
  try {
    return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

export function logAuditEvent(userId: string, action: string, resourceId: string, details: string): AuditBlock {
  const chain = getAuditChain();
  const previousBlock = chain.length > 0 ? chain[chain.length - 1] : null;
  
  const newBlock: AuditBlock = {
    index: previousBlock ? previousBlock.index + 1 : 0,
    timestamp: new Date().toISOString(),
    userId,
    action,
    resourceId,
    details,
    previousHash: previousBlock ? previousBlock.hash : '0',
    hash: ''
  };
  
  newBlock.hash = calculateHash(newBlock.index, newBlock.timestamp, newBlock.userId, newBlock.action, newBlock.resourceId, newBlock.details, newBlock.previousHash);
  
  chain.push(newBlock);
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(chain, null, 2));
  return newBlock;
}

export function verifyAuditChain(): { valid: boolean; compromisedIndex?: number } {
  const chain = getAuditChain();
  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const previous = chain[i - 1];
    
    if (current.previousHash !== previous.hash) {
      return { valid: false, compromisedIndex: i };
    }
    
    const calculatedHash = calculateHash(current.index, current.timestamp, current.userId, current.action, current.resourceId, current.details, current.previousHash);
    if (current.hash !== calculatedHash) {
      return { valid: false, compromisedIndex: i };
    }
  }
  return { valid: true };
}
