interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}

export default function PageHeader({ title, description, action, icon }: PageHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#76C043] to-[#569130] flex items-center justify-center text-white shadow-lg">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
                    </div>
                </div>
                {action && <div>{action}</div>}
            </div>
        </div>
    );
}
