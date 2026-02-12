'use client';

import { Modal } from '@/components/ui/modal';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatPhoneNumber, formatPhoneLink, isLicenseExpired } from '@/lib/utils';
import { useTranslations } from '@/components/providers/language-provider';

interface DriverProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    driver: {
        id: string;
        driver_id: string;
        driver_name: string;
        driver_email?: string;
        phone?: string | null;
        license_document_url?: string | null;
        profile_image_url?: string | null;
        vehicle_photo_urls?: string[] | null;
        chauffeur_license_url?: string | null;
        chauffeur_license_expires_at?: Date | null;
        chauffeur_license_verified?: boolean | null;
        name: string; // The route name
    } | null;
}

export function DriverProfileDialog({ isOpen, onClose, driver }: DriverProfileDialogProps) {
    const t = useTranslations('profile');
    const tUpload = useTranslations('upload');

    if (!driver) return null;

    const chauffeurExpired = driver.chauffeur_license_expires_at
        ? isLicenseExpired(driver.chauffeur_license_expires_at)
        : false;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Driver Profile">
            <div className="space-y-8">
                {/* Header Profile Section */}
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-lg flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                        {driver.profile_image_url ? (
                            <Image
                                src={driver.profile_image_url}
                                alt={driver.driver_name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                        )}
                    </div>

                    <div className="space-y-2 flex-1">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{driver.driver_name}</h3>
                            <p className="text-slate-500 font-medium">{t('route')}: {driver.name}</p>
                            {driver.phone && (
                                <a
                                    href={formatPhoneLink(driver.phone)}
                                    className="text-[#C85A6E] hover:underline dark:text-[#C85A6E] font-medium"
                                >
                                    {formatPhoneNumber(driver.phone)}
                                </a>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A574]/10 text-[#D4A574] dark:bg-[#D4A574]/20 dark:text-[#D4A574] text-sm font-medium border border-[#D4A574]/20 dark:border-[#D4A574]/30">
                                <span>🛡️</span> {tUpload('verified')} Driver
                            </div>
                            {driver.license_document_url && (
                                <a
                                    href={driver.license_document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 text-sm font-medium border border-green-100 dark:border-green-800 hover:bg-green-100 transition-colors"
                                >
                                    <span>📄</span> {t('viewLicense')}
                                </a>
                            )}
                            {driver.chauffeur_license_url && (
                                <a
                                    href={driver.chauffeur_license_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                                        chauffeurExpired
                                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-100 dark:border-red-800 hover:bg-red-100'
                                            : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-100 dark:border-green-800 hover:bg-green-100'
                                    }`}
                                >
                                    <span>🪪</span> {chauffeurExpired ? `Chauffeur License (${tUpload('expired')})` : t('viewChauffeurLicense')}
                                </a>
                            )}
                        </div>

                        <div className="pt-2">
                            <Link href={`/dashboard/messages?partnerId=${driver.driver_id}`} onClick={onClose}>
                                <Button className="w-full md:w-auto">
                                    {t('sendMessage')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                {/* Chauffeur License Section */}
                {driver.chauffeur_license_url && (
                    <>
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>🪪</span> Miami-Dade Chauffeur&apos;s License
                            </h4>
                            <a
                                href={driver.chauffeur_license_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative block w-full max-w-md aspect-video rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-sm group cursor-zoom-in"
                            >
                                <Image
                                    src={driver.chauffeur_license_url}
                                    alt="Chauffeur License"
                                    fill
                                    className="object-contain bg-slate-50 dark:bg-slate-900 transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </a>
                            {driver.chauffeur_license_expires_at && (
                                <p className={`text-sm font-medium ${
                                    chauffeurExpired
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-green-600 dark:text-green-400'
                                }`}>
                                    {chauffeurExpired ? `✗ ${tUpload('expired')}` : `✓ ${tUpload('verified')}`} - {tUpload('expires')}: {new Date(driver.chauffeur_license_expires_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-slate-800" />
                    </>
                )}

                {/* Vehicle Section */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>🚙</span> {t('vehiclePhotos')}
                    </h4>

                    {driver.vehicle_photo_urls && driver.vehicle_photo_urls.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {driver.vehicle_photo_urls.map((url, index) => (
                                <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group cursor-zoom-in"
                                >
                                    <Image
                                        src={url}
                                        alt={`Vehicle photo ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
                            <p>{t('noVehiclePhotos')}</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
