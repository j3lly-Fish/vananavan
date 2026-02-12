'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateVehiclePhotos } from '@/app/dashboard/driver/actions';
import { toast } from 'sonner';
import Image from 'next/image';
import { X } from 'lucide-react';

interface VehiclePhotosManagerProps {
    initialUrls: string[];
}

export function VehiclePhotosManager({ initialUrls }: VehiclePhotosManagerProps) {
    const [urls, setUrls] = useState<string[]>(initialUrls);
    const [isUploading, setIsUploading] = useState(false);
    const MAX_PHOTOS = 5;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (urls.length >= MAX_PHOTOS) {
            toast.error(`You can only upload up to ${MAX_PHOTOS} photos.`);
            return;
        }

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
                const newUrls = [...urls, newUrl];

                // Auto-save path to profile
                const saveResult = await updateVehiclePhotos(newUrls);
                if (saveResult.success) {
                    setUrls(newUrls);
                    toast.success('Vehicle photo added!');
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
            // Reset input
            e.target.value = '';
        }
    };

    const handleRemove = async (indexToRemove: number) => {
        const newUrls = urls.filter((_, index) => index !== indexToRemove);
        const saveResult = await updateVehiclePhotos(newUrls);
        if (saveResult.success) {
            setUrls(newUrls);
            toast.success('Photo removed');
        } else {
            toast.error('Failed to remove photo');
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {urls.map((url, index) => (
                    <div key={url} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 group">
                        <Image
                            src={url}
                            alt={`Vehicle photo ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            onClick={() => handleRemove(index)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove photo"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {urls.length < MAX_PHOTOS && (
                    <div className="relative aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer">
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
                        ) : (
                            <>
                                <span className="text-4xl text-slate-300 dark:text-slate-600">+</span>
                                <span className="text-xs font-medium">Add Photo</span>
                            </>
                        )}
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-500">
                {urls.length} / {MAX_PHOTOS} photos uploaded
            </p>
        </div>
    );
}
