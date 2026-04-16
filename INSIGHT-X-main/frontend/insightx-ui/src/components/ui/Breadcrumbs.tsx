import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link
                        to="/"
                        className="text-xs text-text-tertiary hover:text-primary-400 hover:underline transition-colors"
                    >
                        Dashboard
                    </Link>
                </li>
                {pathnames.length > 0 && (
                    <li className="text-text-tertiary">
                        <ChevronRight className="h-3 w-3" />
                    </li>
                )}
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

                    return (
                        <li key={to} className="flex items-center space-x-2">
                            {isLast ? (
                                <span className="text-xs text-text-primary capitalize" aria-current="page">
                                    {value.replace(/-/g, ' ')}
                                </span>
                            ) : (
                                <>
                                    <Link
                                        to={to}
                                        className="text-xs text-text-tertiary hover:text-primary-400 hover:underline transition-colors capitalize"
                                    >
                                        {value.replace(/-/g, ' ')}
                                    </Link>
                                    <ChevronRight className="h-3 w-3 text-text-tertiary" />
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
