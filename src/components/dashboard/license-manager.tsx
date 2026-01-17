'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateLicense } from '@/app/dashboard/driver/actions';
import { toast } from 'sonner';

interface LicenseManagerProps {
    initialUrl: string;
}

export function LicenseManager({ initialUrl }: LicenseManagerProps) {
    const [url, setUrl] = useState(initialUrl);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setUrl(data.url); // Use the returned relative URL
                // Auto-save path to profile
                const saveResult = await updateLicense(data.url);
                if (saveResult.success) {
                    toast.success('Document uploaded and saved!');
                } else {
                    toast.error('Uploaded but failed to save to profile');
                }
            } else {
                toast.error('Upload failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            toast.error('Upload error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateLicense(url);
        setIsSaving(false);

        if (result.success) {
            toast.success('License updated successfully');
        } else {
            toast.error('Failed to update license');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                    />
                    <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📄</span>
                        </div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {isUploading ? 'Uploading...' : 'Click or Drag file to upload'}
                        </div>
                        <p className="text-xs text-slate-500">PDF, JPG, PNG up to 5MB</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                    <span className="text-xs text-slate-500">OR ENTER URL</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="url"
                        placeholder="https://..."
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
            {url && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Current Document:</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                        {url}
                    </a>
                </div>
            )}
        </div>
    );
}
