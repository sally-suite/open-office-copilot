'use client';

import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,

} from '@/components/ui/select'
import api from '@/request';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { toast } from "sonner"

interface SearchConfig {
    searchEngine: string;
    apiKey: string;
}

const ConfigKey = 'search_text';

export default function SearchConfigPage() {
    const [config, setConfig] = useState<SearchConfig>({
        searchEngine: '',
        apiKey: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await api.getAdminConfig({
                    name: ConfigKey
                });
                if (data?.value) {
                    setConfig(JSON.parse(data.value));
                }
            } catch (error) {
                console.error('Failed to fetch search config:', error);
            }
        };
        fetchConfig();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await api.addAdminConfig({
            name: ConfigKey,
            value: JSON.stringify(config)
        });
        setLoading(false);
        toast.success('Configuration saved successfully');
    };

    const handleChange = (field: keyof SearchConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const onEnginChange = (value: string) => {
        setConfig(prev => ({
            ...prev,
            searchEngine: value
        }));
    }

    return (
        <div className="container mx-auto py-2">
            <h1 className="text-2xl font-bold mb-6">Search Configuration</h1>
            <form className="max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Search Engine
                    </label>
                    <Select onValueChange={onEnginChange} value={config.searchEngine}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select engine" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="google">Google</SelectItem>
                            <SelectItem value="baidu">Baidu</SelectItem>
                        </SelectContent>
                    </Select>

                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        API Key
                    </label>
                    <Input
                        type="password"
                        value={config.apiKey}
                        onChange={handleChange('apiKey')}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Enter API key"
                        required
                    />
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? 'Saving...' : 'Save Configuration'}
                </Button>
            </form>
        </div>
    );
}