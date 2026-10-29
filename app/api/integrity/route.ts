/**
 * رتل - Ratil
 * Serverless API: فحص سلامة النص القرآني والخطوط ومطابقة SHA-256
 * app/api/integrity/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getFileSha256(filePath: string): string {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return '';
  const buffer = fs.readFileSync(fullPath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function GET(req: NextRequest) {
  try {
    const checksumsPath = path.join(process.cwd(), 'data', 'checksums.json');
    const checksums = JSON.parse(fs.readFileSync(checksumsPath, 'utf8'));

    // فحص نص حفص
    const hafsHash = getFileSha256(checksums.sources.hafs.file);
    const hafsMatch = hafsHash === checksums.sources.hafs.sha256;

    // فحص نص ورش
    const warshHash = getFileSha256(checksums.sources.warsh.file);
    const warshMatch = warshHash === checksums.sources.warsh.sha256;

    // فحص خط حفص
    const fontHafsHash = getFileSha256(checksums.fonts.hafs.file);
    const fontHafsMatch = fontHafsHash === checksums.fonts.hafs.sha256;

    // فحص خط ورش
    const fontWarshHash = getFileSha256(checksums.fonts.warsh.file);
    const fontWarshMatch = fontWarshHash === checksums.fonts.warsh.sha256;

    const allPassed = hafsMatch && warshMatch && fontHafsMatch && fontWarshMatch;

    return NextResponse.json({
      status: allPassed ? 'verified' : 'mismatch',
      timestamp: new Date().toISOString(),
      details: {
        hafs: {
          authority: checksums.sources.hafs.authority,
          total_ayahs: checksums.sources.hafs.total_ayahs,
          expected: checksums.sources.hafs.sha256,
          actual: hafsHash,
          matched: hafsMatch,
        },
        warsh: {
          authority: checksums.sources.warsh.authority,
          total_ayahs: checksums.sources.warsh.total_ayahs,
          expected: checksums.sources.warsh.sha256,
          actual: warshHash,
          matched: warshMatch,
        },
        font_hafs: {
          authority: checksums.fonts.hafs.authority,
          expected: checksums.fonts.hafs.sha256,
          actual: fontHafsHash,
          matched: fontHafsMatch,
        },
        font_warsh: {
          authority: checksums.fonts.warsh.authority,
          expected: checksums.fonts.warsh.sha256,
          actual: fontWarshHash,
          matched: fontWarshMatch,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
