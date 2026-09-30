import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads/officer-certificates");

function ensureDir(): void {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/png": ".png",
  "image/x-png": ".png",
};

function extensionOf(file: Express.Multer.File): string {
  const fromMime = ALLOWED_MIME[file.mimetype];
  if (fromMime) return fromMime;
  // image/jpeg uploads may arrive with a .jpeg original name; preserve it.
  const fromName = path.extname(file.originalname).toLowerCase();
  if (fromName === ".jpeg") return ".jpeg";
  return fromName;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = extensionOf(file);
    const safeExt = [".pdf", ".jpg", ".jpeg", ".png"].includes(ext) ? ext : ".bin";
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${safeExt}`);
  },
});

function fileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  // Accept only PDF/JPG/JPEG/PNG. Never allow executables.
  if (ALLOWED_MIME[file.mimetype]) {
    cb(null, true);
    return;
  }
  cb(new Error("Only PDF, JPG, JPEG and PNG files are allowed"));
}

export const officerCertificateUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

/**
 * Multi-file upload for the one-shot officer registration endpoint
 * POST /api/auth/register-officer (multipart/form-data).
 * Same storage rules: PDF / JPG / JPEG / PNG, 5 MB per file.
 */
export const officerRegistrationUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

export const OFFICER_UPLOAD_DIR = UPLOAD_DIR;

/** Public-ish URL served by express.static under /uploads. No absolute FS paths leak. */
export function certificateFileUrl(filename: string): string {
  return `/uploads/officer-certificates/${filename}`;
}

/** Best-effort removal of partially uploaded files after a failed registration. */
export function deleteUploadedFiles(files: Array<{ path?: string; filename?: string }>): void {
  for (const f of files) {
    try {
      const full = f.path ?? (f.filename ? path.join(UPLOAD_DIR, f.filename) : null);
      if (full && fs.existsSync(full)) fs.unlinkSync(full);
    } catch {
      /* ignore cleanup failures */
    }
  }
}

