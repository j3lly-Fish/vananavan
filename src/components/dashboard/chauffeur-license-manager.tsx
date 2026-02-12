'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateChauffeurLicense } from '@/app/dashboard/driver/actions';
import { toast } from 'sonner';
import { isLicenseExpired } from '@/lib/utils';
import { useTranslations } from '@/components/providers/language-provider';

interface ChauffeurLicenseManagerProps {
    initialUrl: string;
    initialExpiresAt: Date | null;
    initialVerified: boolean;
}

export function ChauffeurLicenseManager({ initialUrl, initialExpiresAt, initialVerified }: ChauffeurLicenseManagerProps) {
    const t = useTranslations('upload');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');

    const [url, setUrl] = useState(initialUrl);
    const [expiresAt, setExpiresAt] = useState<string>(
        initialExpiresAt ? new Date(initialExpiresAt).toISOString().split('T')[0] : ''
    );
    const [isVerified, setIsVerified] = useState(initialVerified);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            toast.error(t('fileTooLarge'));
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
                setUrl(data.url);
                // Don't auto-save until expiration date is provided
                if (expiresAt) {
                    const saveResult = await updateChauffeurLicense(data.url, new Date(expiresAt));
                    if (saveResult.success) {
                        const expired = isLicenseExpired(new Date(expiresAt));
                        setIsVerified(!expired);
                        toast.success(t('uploadSuccess'));
                    } else {
                        toast.error(tErrors('saveFailed'));
                    }
                } else {
                    toast.success('Document uploaded! Please set expiration date and save.');
                }
            } else {
                toast.error(t('uploadError') + ': ' + data.error);
            }
        } catch (err) {
            console.error(err);
            toast.error(t('uploadError'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!url) {
            toast.error('Please upload a license document');
            return;
        }
        if (!expiresAt) {
            toast.error('Please select an expiration date');
            return;
        }

        setIsSaving(true);
        const result = await updateChauffeurLicense(url, new Date(expiresAt));
        setIsSaving(false);

        if (result.success) {
            const expired = isLicenseExpired(new Date(expiresAt));
            setIsVerified(!expired);
            toast.success('Chauffeur license updated successfully');
        } else {
            toast.error(tErrors('saveFailed'));
        }
    };

    const expired = expiresAt ? isLicenseExpired(new Date(expiresAt)) : false;

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
                        <div className="mx-auto w-12 h-12 bg-[#D4A574]/10 dark:bg-[#D4A574]/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🪪</span>
                        </div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {isUploading ? tCommon('uploading') : t('clickOrDragLicense')}
                        </div>
                        <p className="text-xs text-slate-500">{t('fileSizeLimit')}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('expirationDate')}
                    </label>
                    <input
                        type="date"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                    <span className="text-xs text-slate-500">{t('orEnterUrl')}</span>
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
                    <Button onClick={handleSave} disabled={isSaving || !expiresAt}>
                        {isSaving ? tCommon('saving') : tCommon('save')}
                    </Button>
                </div>
            </div>
            {url && (
                <div className={`mt-2 p-3 rounded-lg border ${
                    expired
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
                }`}>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold uppercase tracking-wider">
                            {t('currentLicense')}:
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            expired
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                            {expired ? `✗ ${t('expired')}` : `✓ ${t('verified')}`}
                        </span>
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline break-all block">
                        {url}
                    </a>
                    {expiresAt && (
                        <p className="text-xs mt-1 opacity-70">
                            {t('expires')}: {new Date(expiresAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
