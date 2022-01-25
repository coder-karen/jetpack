/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function Save() {
	return (
		<div className="donations__tab">
			<InnerBlocks.Content />
		</div>
	);
}
