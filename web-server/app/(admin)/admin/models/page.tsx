"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/Button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/request";
import Loading from "@/components/Loading";

interface Model {
    id: number;
    email: string;
    provider: string;
    model: string;
    baseUrl: string;
    apiKey: string;
    createdAt: string;
    updatedAt: string;
}

export default function ModelsPage() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [deleteModelId, setDeleteModelId] = useState<number | null>(null);
    const [newModel, setNewModel] = useState({
        email: "empty",
        provider: "system",
        model: "",
        baseUrl: "",
        apiKey: "",
    });

    const fetchModels = async () => {
        try {
            setLoading(true);
            const response = await api.getAdminModels({});
            setModels(response);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch models:", error);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const handleAddModel = async () => {
        try {
            const { apiKey, baseUrl, model, provider, email } = newModel;
            await api.addAdminModel({
                apiKey: apiKey.trim(),
                baseUrl: baseUrl.trim(),
                model: model.trim(),
                provider: 'system',
                email: 'empty',
            });
            setIsAddDialogOpen(false);
            setNewModel({
                email: "empty",
                provider: "system",
                model: "",
                baseUrl: "",
                apiKey: "",
            });
            fetchModels();
        } catch (error) {
            console.error("Failed to add model:", error);
        }
    };

    const handleDeleteModel = async (id: number) => {
        try {
            await api.removeAdminModel({ id });
            setDeleteModelId(null);
            fetchModels();
        } catch (error) {
            console.error("Failed to delete model:", error);
        }
    };

    return (
        <div className="container mx-auto py-2">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Models Management</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New Model</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Model</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={newModel.model}
                                    onChange={(e) =>
                                        setNewModel({ ...newModel, model: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="baseUrl">Base URL</Label>
                                <Input
                                    id="baseUrl"
                                    value={newModel.baseUrl}
                                    onChange={(e) =>
                                        setNewModel({ ...newModel, baseUrl: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="apiKey">API Key</Label>
                                <Input
                                    id="apiKey"
                                    type="password"
                                    value={newModel.apiKey}
                                    onChange={(e) =>
                                        setNewModel({ ...newModel, apiKey: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddModel}>Add Model</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {
                loading && (
                    <Loading />
                )
            }
            {
                !loading && models.length === 0 && (
                    <div className="text-center">No models found</div>
                )
            }
            {
                !loading && models.length > 0 && (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Base URL</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {models.map((model) => (
                                    <TableRow key={model.id}>
                                        <TableCell>{model.provider}</TableCell>
                                        <TableCell>{model.model}</TableCell>
                                        <TableCell>{model.baseUrl}</TableCell>
                                        <TableCell>
                                            {new Date(model.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <AlertDialog
                                                open={deleteModelId === model.id}
                                                onOpenChange={(open) =>
                                                    setDeleteModelId(open ? model.id : null)
                                                }
                                            >
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setDeleteModelId(model.id)}
                                                >
                                                    Delete
                                                </Button>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Model</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this model? This action
                                                            cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setDeleteModelId(null)}>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteModel(model.id)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )
            }

        </div>
    );
}