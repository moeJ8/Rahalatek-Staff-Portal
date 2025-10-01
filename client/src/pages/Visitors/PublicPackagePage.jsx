import React from 'react';
import { useParams } from 'react-router-dom';

export default function PublicPackagePage() {
    const { slug } = useParams();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Public Package Page
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Package Slug: {slug}
                </p>
                <p className="text-gray-500 dark:text-gray-500">
                    This page is under development.
                </p>
            </div>
        </div>
    );
}
