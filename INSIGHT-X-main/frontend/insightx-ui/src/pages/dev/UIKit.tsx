import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toaster } from '../../components/ui/Toast';
import { useToast } from '../../components/ui/Toast';
import { Tooltip } from '../../components/ui/Tooltip';
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from '../../components/ui/Drawer';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Spinner } from '../../components/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { Dropdown } from '../../components/ui/Dropdown';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { DataTable } from '../../components/ui/DataTable';
import { MetricCard } from '../../components/ui/MetricCard';
import { LineChart, BarChart, PieChart, AreaChart } from '../../components/ui/charts';
import { AdvancedFilter } from '../../components/search/AdvancedFilter';
import { Info, Bell, Shield, User, TrendingUp, DollarSign, Activity, Users } from 'lucide-react';

export default function UIKit() {
    const { toast } = useToast();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dropdownValue, setDropdownValue] = useState('');
    const [multiDropdownValue, setMultiDropdownValue] = useState<string[]>([]);

    return (
        <div className="p-8 space-y-12 bg-bg-primary min-h-screen text-text-primary">
            <header>
                <h1 className="text-3xl font-bold mb-2">UI Component Kit</h1>
                <p className="text-text-secondary">Verification of Bundle 6 components against design.json</p>
            </header>

            {/* Buttons */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Buttons</h2>
                <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button loading>Loading</Button>
                </div>
            </section>

            {/* Badges */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Badges</h2>
                <div className="flex flex-wrap gap-4">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="outline">Outline</Badge>
                </div>
            </section>

            {/* Alerts */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Alerts</h2>
                <div className="grid gap-4 max-w-2xl">
                    <Alert variant="info">
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>System update available.</AlertDescription>
                    </Alert>
                    <Alert variant="danger" onClose={() => { }}>
                        <AlertTitle>Critical Error</AlertTitle>
                        <AlertDescription>Failed to connect to Trust Engine.</AlertDescription>
                    </Alert>
                </div>
            </section>

            {/* Toast */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Toast Notifications</h2>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={() => toast({ title: 'Success', description: 'Action completed successfully', variant: 'success' })}>
                        Success Toast
                    </Button>
                    <Button variant="danger" onClick={() => toast({ title: 'Error', description: 'Something went wrong', variant: 'danger' })}>
                        Error Toast
                    </Button>
                </div>
            </section>

            {/* Tooltips */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Tooltips</h2>
                <div className="flex gap-8">
                    <Tooltip content="This is a top tooltip" position="top">
                        <Button variant="secondary">Top</Button>
                    </Tooltip>
                    <Tooltip content="This is a right tooltip" position="right">
                        <Button variant="secondary">Right</Button>
                    </Tooltip>
                </div>
            </section>

            {/* Loaders */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Loaders</h2>
                <div className="flex items-center gap-8">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <Skeleton className="h-12 w-64" />
                </div>
            </section>

            {/* Overlay Components */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Overlay Components</h2>
                <div className="flex gap-4">
                    <Button onClick={() => setIsDrawerOpen(true)}>Open Drawer</Button>
                    <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                </div>

                <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                    <DrawerHeader onClose={() => setIsDrawerOpen(false)}>Drawer Title</DrawerHeader>
                    <DrawerBody>
                        <p>This is the drawer content.</p>
                    </DrawerBody>
                    <DrawerFooter>
                        <Button variant="secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsDrawerOpen(false)}>Save</Button>
                    </DrawerFooter>
                </Drawer>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <ModalHeader onClose={() => setIsModalOpen(false)}>Modal Title</ModalHeader>
                    <ModalBody>
                        <p>This is the modal content.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
                    </ModalFooter>
                </Modal>
            </section>

            {/* Inputs & Dropdowns */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Inputs & Dropdowns</h2>
                <div className="grid grid-cols-2 gap-8 max-w-4xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Single Select</label>
                        <Dropdown
                            options={[
                                { value: 'option1', label: 'Option 1' },
                                { value: 'option2', label: 'Option 2' },
                                { value: 'option3', label: 'Option 3' },
                            ]}
                            value={dropdownValue}
                            onChange={(val) => setDropdownValue(val as string)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Multi-Select (Searchable)</label>
                        <Dropdown
                            multiple
                            searchable
                            options={[
                                { value: 'react', label: 'React' },
                                { value: 'vue', label: 'Vue' },
                                { value: 'angular', label: 'Angular' },
                                { value: 'svelte', label: 'Svelte' },
                            ]}
                            value={multiDropdownValue}
                            onChange={(val) => setMultiDropdownValue(val as string[])}
                        />
                    </div>
                </div>
            </section>

            {/* Cards */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <div className="p-4">
                            <h3 className="font-semibold mb-2">Default Card</h3>
                            <p className="text-sm text-text-secondary">This is a standard card component.</p>
                        </div>
                    </Card>
                    <Card variant="elevated">
                        <div className="p-4">
                            <h3 className="font-semibold mb-2">Elevated Card</h3>
                            <p className="text-sm text-text-secondary">This card has a stronger shadow elevation.</p>
                        </div>
                    </Card>
                    <Card variant="glass">
                        <div className="p-4">
                            <h3 className="font-semibold mb-2">Glass Card</h3>
                            <p className="text-sm text-text-secondary">This card has a glassmorphism effect.</p>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Form Elements */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Form Elements</h2>
                <div className="max-w-md space-y-4">
                    <Input placeholder="Default Input" />
                    <Input placeholder="Invalid Input" error />
                    <Select
                        options={[
                            { value: '1', label: 'Option 1' },
                            { value: '2', label: 'Option 2' },
                        ]}
                        value=""
                        onChange={() => { }}
                        placeholder="Basic Select"
                    />
                </div>
            </section>

            {/* Tabs */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Tabs</h2>
                <Tabs
                    tabs={[
                        { id: 'tab1', label: 'Account', icon: <User className="h-4 w-4" /> },
                        { id: 'tab2', label: 'Security', icon: <Shield className="h-4 w-4" /> },
                        { id: 'tab3', label: 'Notifications', icon: <Bell className="h-4 w-4" />, count: 3 },
                    ]}
                    defaultTab="tab1"
                >
                    {(activeTab) => (
                        <div className="p-4 bg-bg-tertiary rounded-b-lg border border-t-0 border-border-subtle">
                            Content for {activeTab}
                        </div>
                    )}
                </Tabs>
            </section>

            {/* Empty State */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Empty State</h2>
                <div className="border border-border-subtle rounded-lg">
                    <EmptyState
                        icon={Info}
                        title="No Data Available"
                        description="There are no items to display at this time."
                        action={{ label: 'Refresh', onClick: () => { } }}
                    />
                </div>
            </section>

            {/* Advanced Filter */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Search & Filters</h2>
                <div className="rounded-lg border border-border-default bg-bg-secondary p-4 flex gap-4 items-center">
                    <p className="text-sm text-text-secondary">Global Command Palette: Press ⌘K</p>
                    <AdvancedFilter
                        filters={[
                            { id: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }] },
                            { id: 'role', label: 'Role', type: 'select', options: [{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }] }
                        ]}
                        activeFilters={{}}
                        onFilterChange={(f) => console.log(f)}
                    />
                </div>
            </section>

            {/* Data Table */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Data Table</h2>
                <div className="rounded-lg border border-border-default bg-bg-secondary p-4">
                    <DataTable
                        columns={[
                            { accessorKey: "id", header: "ID" },
                            { accessorKey: "name", header: "Name" },
                            { accessorKey: "role", header: "Role" },
                            { accessorKey: "status", header: "Status" },
                        ]}
                        data={[
                            { id: "1", name: "John Doe", role: "Admin", status: "Active" },
                            { id: "2", name: "Jane Smith", role: "User", status: "Inactive" },
                            { id: "3", name: "Bob Johnson", role: "User", status: "Active" },
                        ]}
                        searchable
                        searchColumn="name"
                    />
                </div>
            </section>

            {/* Form Demo */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Form (React Hook Form + Zod)</h2>
                <div className="rounded-lg border border-border-default bg-bg-secondary p-4 max-w-md">
                    <p className="text-sm text-text-secondary mb-4">
                        Form components integrated with react-hook-form and zod validation.
                        (See code for implementation details - requires FormProvider setup)
                    </p>
                    <div className="space-y-4">
                        {/* Mock visual representation since actual form needs logic setup */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Username</label>
                            <Input placeholder="username" />
                            <p className="text-[0.8rem] text-text-tertiary">This is your public display name.</p>
                        </div>
                    </div>
                </div>
                {/* Form Demo */}
                {/* ... previous content ... */}
            </section>

            {/* Metrics & Charts */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold border-b border-border-default pb-2">Metrics & Charts</h2>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Revenue"
                        value="$45,231.89"
                        trend={{ value: 20.1, label: "from last month" }}
                        icon={<DollarSign className="w-5 h-5" />}
                    />
                    <MetricCard
                        title="Active Users"
                        value="+2350"
                        trend={{ value: 180.1, label: "from last month" }}
                        icon={<Users className="w-5 h-5" />}
                    />
                    <MetricCard
                        title="Sales"
                        value="+12,234"
                        trend={{ value: 19, label: "from last month" }}
                        icon={<Activity className="w-5 h-5" />}
                    />
                    <MetricCard
                        title="Active Now"
                        value="+573"
                        trend={{ value: 201, label: "since last hour" }}
                        icon={<TrendingUp className="w-5 h-5" />}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AreaChart
                        title="Revenue Growth"
                        description="Revenue over user growth"
                        data={[
                            { date: 'Jan', revenue: 2400, users: 1200 },
                            { date: 'Feb', revenue: 1398, users: 2100 },
                            { date: 'Mar', revenue: 9800, users: 2200 },
                            { date: 'Apr', revenue: 3908, users: 2000 },
                            { date: 'May', revenue: 4800, users: 2181 },
                            { date: 'Jun', revenue: 3800, users: 2500 },
                        ]}
                        categories={['revenue', 'users']}
                        index="date"
                        className="min-h-[350px]"
                    />
                    <BarChart
                        title="Sales Distribution"
                        description="Sales by category"
                        data={[
                            { name: 'A', uv: 4000, pv: 2400 },
                            { name: 'B', uv: 3000, pv: 1398 },
                            { name: 'C', uv: 2000, pv: 9800 },
                            { name: 'D', uv: 2780, pv: 3908 },
                            { name: 'E', uv: 1890, pv: 4800 },
                            { name: 'F', uv: 2390, pv: 3800 },
                        ]}
                        categories={['uv', 'pv']}
                        index="name"
                        className="min-h-[350px]"
                    />
                    <LineChart
                        title="Engagement Trends"
                        description="Daily active users"
                        data={[
                            { day: 'Mon', active: 4000, inactive: 2400 },
                            { day: 'Tue', active: 3000, inactive: 1398 },
                            { day: 'Wed', active: 2000, inactive: 9800 },
                            { day: 'Thu', active: 2780, inactive: 3908 },
                            { day: 'Fri', active: 1890, inactive: 4800 },
                            { day: 'Sat', active: 2390, inactive: 3800 },
                            { day: 'Sun', active: 3490, inactive: 4300 },
                        ]}
                        categories={['active', 'inactive']}
                        index="day"
                        className="min-h-[350px]"
                    />
                    <PieChart
                        title="Traffic Sources"
                        description="Source of recent visits"
                        data={[
                            { name: 'Direct', value: 400 },
                            { name: 'Social', value: 300 },
                            { name: 'Organic', value: 300 },
                            { name: 'Referral', value: 200 },
                        ]}
                        category="value"
                        index="name"
                        donut
                        className="min-h-[350px]"
                    />
                </div>
            </section>

            <Toaster />
        </div>
    );
}
