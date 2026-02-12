'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteRoute } from '@/app/dashboard/driver/actions';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Route {
    id: string;
    name: string | null;
    pathWkt: string;
    createdAt: Date;
}

interface RouteListProps {
    routes: Route[];
    onEdit: (route: Route) => void;
    onNew: () => void;
}

export function RouteList({ routes, onEdit, onNew }: RouteListProps) {
    const [search, setSearch] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const filteredRoutes = routes.filter(r =>
        (r.name || 'Untitled Route').toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this route?')) return;

        setIsDeleting(id);
        const result = await deleteRoute(id);
        setIsDeleting(null);

        if (result.success) {
            toast.success('Route deleted');
        } else {
            toast.error('Failed to delete route');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search routes..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={onNew} variant="outline">New Route</Button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredRoutes.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">No routes found.</p>
                ) : (
                    filteredRoutes.map(route => (
                        <div
                            key={route.id}
                            onClick={() => onEdit(route)}
                            className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#D4A574] cursor-pointer transition-all bg-white dark:bg-slate-950 flex justify-between items-center group"
                        >
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">{route.name || 'Untitled Route'}</h3>
                                <p className="text-xs text-slate-500">Created {formatDistanceToNow(new Date(route.createdAt), { addSuffix: true })}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" className="text-[#D4A574]">Edit</Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => handleDelete(route.id, e)}
                                    disabled={isDeleting === route.id}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
