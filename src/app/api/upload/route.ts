import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.name.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + path.extname(file.name);

        // Save to public/uploads
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);
        const url = `/uploads/${filename}`;

        return NextResponse.json({ success: true, url });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
    }
}
