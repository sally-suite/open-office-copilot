/* eslint-disable no-inner-declarations */
import { ITool } from "chat-list/types/plugin";
import { pipInstall } from '../util';

/**
 * Install Python Packages
 */
export const func = async ({ packages }: { packages: string[] }) => {
    if (packages && packages.length > 0) {
        await pipInstall(packages);
        return `I have installed the following packages: ${packages.join(', ')}.`;
    } else {
        return `Sorry! There is no package to install.`;
    }
};

export default {
    type: 'function',
    name: 'pip_install',
    description: "Install Python packages",
    parameters: {
        "type": "object",
        "properties": {
            "packages": {
                "type": "array",
                "description": `Python packages`,
                "items": {
                    "type": "string",
                    "description": `Python package name`
                },
            }
        },
        "required": [
            "packages"
        ]
    },
    func
} as unknown as ITool;
