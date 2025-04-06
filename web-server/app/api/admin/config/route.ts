import { NextRequest, NextResponse } from 'next/server';
import Config from '@/models/config';

// Get all configs
export async function GET(request: NextRequest) {
    try {
        //get query name from url
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const config = await Config.findOne({ where: { name } });
        return NextResponse.json({
            code: 0,
            data: config
        });
    } catch (error) {
        return NextResponse.json({
            code: 1,
            message: 'Failed to get config'
        });
    }
}

// Create new config
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, value } = body;

        if (!name || !value) {
            return NextResponse.json({ error: 'Name and value are required' }, { status: 400 });
        }

        // find name in config
        const config = await Config.findOne({ where: { name } });
        if (config) {
            // update value
            await config.update({ value }, { where: { name } });
            return NextResponse.json({
                code: 0,
                data: config
            });
        } else {
            // create new config
            const config = await Config.create({ name, value });
            return NextResponse.json({
                code: 0,
                data: config
            });
        }

    } catch (error) {
        return NextResponse.json({
            code: 1,
            message: 'Failed to create config'
        });
    }
}

// Update config
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, value } = body;

        if (!id || (!name && !value)) {
            return NextResponse.json({ error: 'ID and at least one field (name or value) are required' }, { status: 400 });
        }

        const config = await Config.findByPk(id);
        if (!config) {
            return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        }

        const updateData: { name?: string; value?: string } = {};
        if (name) updateData.name = name;
        if (value) updateData.value = value;

        await config.update(updateData);
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }
}

// Delete config
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const config = await Config.findByPk(id);
        if (!config) {
            return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        }

        await config.destroy();
        return NextResponse.json({ message: 'Config deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
    }
}