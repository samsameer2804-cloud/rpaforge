/**
 * Secure variable storage utility.
 *
 * Provides basic encryption for sensitive variables stored in IndexedDB.
 */

import type { VariableDefinition } from '../components/Designer/VariableDialog';

const SENSITIVE_PATTERN = /password|key|token|secret/i;

/**
 * Check if a variable name suggests sensitive data.
 */
function isSensitiveVariable(name: string): boolean {
  return SENSITIVE_PATTERN.test(name);
}

/**
 * Encrypt a value using simple obfuscation (placeholder for real encryption).
 * In production, use Web Crypto API with OS-level keychain.
 */
function encryptVariable(value: string): string {
  const key = 'rpaforge_encryption_key_2024';
  let result = '';
  for (let i = 0; i < value.length; i++) {
    result += String.fromCharCode(value.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

/**
 * Decrypt a value (placeholder for real decryption).
 */
function decryptVariable(encrypted: string): string {
  try {
    const decoded = atob(encrypted);
    const key = 'rpaforge_encryption_key_2024';
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return encrypted;
  }
}

/**
 * Encrypt all sensitive variables in a list.
 */
export async function encryptVariables(
  variables: VariableDefinition[]
): Promise<VariableDefinition[]> {
  return variables.map((v) => {
    if (isSensitiveVariable(v.name) && v.value) {
      return { ...v, value: encryptVariable(v.value) };
    }
    return v;
  });
}

/**
 * Decrypt all sensitive variables in a list.
 */
export async function decryptVariables(
  variables: VariableDefinition[]
): Promise<VariableDefinition[]> {
  return variables.map((v) => {
    if (isSensitiveVariable(v.name) && v.value && !v.value.startsWith('{')) {
      return { ...v, value: decryptVariable(v.value) };
    }
    return v;
  });
}
