// src/components/screenshots/ViewToggle.jsx

import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@components/ui/tooltip';

export default function ViewToggle({ viewMode, onViewModeChange }) {
	return (
		<TooltipProvider>
			<div className='flex items-center gap-1 border border-border rounded-md p-1'>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
							size='sm'
							onClick={() => onViewModeChange('grid')}
							className='h-7 px-2'
							aria-label='Grid view'>
							<LayoutGrid className='h-4 w-4' />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Grid view</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant={viewMode === 'list' ? 'secondary' : 'ghost'}
							size='sm'
							onClick={() => onViewModeChange('list')}
							className='h-7 px-2'
							aria-label='List view'>
							<LayoutList className='h-4 w-4' />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>List view</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}
