'use client';

import { Modal } from '@/components/ui/modal';
import { useTranslations } from '@/components/providers/language-provider';

interface TosModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TosModal({ isOpen, onClose }: TosModalProps) {
    const t = useTranslations('tos');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
            <div className="prose prose-slate dark:prose-invert max-w-none">
                <section className="mb-8">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{t('userResponsibilities')}</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        By using VanaNavan, you agree to provide accurate information about your identity, contact details,
                        and any relevant documentation. Users are responsible for maintaining the confidentiality of their
                        account credentials and for all activities that occur under their account. Parents must ensure that
                        children are supervised during transportation, and drivers must maintain valid licenses and insurance.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{t('platformUsage')}</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        VanaNavan is a platform that connects parents seeking transportation services with qualified drivers.
                        The platform facilitates communication and route matching but does not employ drivers or guarantee
                        transportation services. All arrangements between parents and drivers are independent agreements.
                        Users must comply with all applicable laws and regulations. Misuse of the platform, including but not
                        limited to harassment, fraud, or providing false information, may result in account termination.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{t('safetyGuidelines')}</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        Safety is our top priority. Drivers must maintain valid driver&apos;s licenses, chauffeur licenses
                        where required, current vehicle insurance, and ensure their vehicles are in safe operating condition.
                        Parents should verify driver credentials, review vehicle information, and communicate pickup/dropoff
                        details clearly. We encourage parents to meet drivers in person before entering into transportation
                        arrangements. Report any safety concerns or incidents to VanaNavan immediately.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{t('privacy')}</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        We respect your privacy and are committed to protecting your personal information. Your contact
                        information, location data, and messages are stored securely and shared only with users you connect
                        with through the platform. We do not sell personal information to third parties. Profile information
                        you choose to share (such as photos, license documents, and routes) will be visible to potential
                        matches. By using VanaNavan, you consent to our collection and use of information as described in
                        our Privacy Policy.
                    </p>
                </section>

                <section className="mb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                        By accepting these Terms of Service, you acknowledge that you have read, understood, and agree to be
                        bound by these terms. VanaNavan reserves the right to modify these terms at any time, and continued
                        use of the platform constitutes acceptance of any changes.
                    </p>
                </section>
            </div>
        </Modal>
    );
}
