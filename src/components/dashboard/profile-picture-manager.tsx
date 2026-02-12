'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateProfileImage } from '@/app/dashboard/driver/actions';
import { toast } from 'sonner';
import Image from 'next/image';

interface ProfilePictureManagerProps {
    initialUrl: string;
}

export function ProfilePictureManager({ initialUrl }: ProfilePictureManagerProps) {
    const [url, setUrl] = useState(initialUrl);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            toast.error("File size must be less than 100MB");
            return;
        }

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
                const newUrl = data.url;
                // Auto-save path to profile
                const saveResult = await updateProfileImage(newUrl);
                if (saveResult.success) {
                    setUrl(newUrl);
                    toast.success('Profile picture updated!');
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

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {url ? (
                        <Image
                            src={url}
                            alt="Profile"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-slate-400">
                            <span className="text-4xl">👤</span>
                        </div>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={isUploading}
                        />
                        <Button variant="outline" className="w-full sm:w-auto" disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Change Photo'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
