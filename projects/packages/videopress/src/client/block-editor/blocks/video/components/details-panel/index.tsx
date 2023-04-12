/**
 * External dependencies
 */
import {
	PanelBody,
	TextareaControl,
	TextControl,
	Notice,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import ChaptersLearnMoreHelper from '../../../../../components/chapters-learn-more-helper';
import IncompleteChaptersNotice from '../../../../../components/incomplete-chapters-notice';
import useChaptersLiveParsing from '../../../../../hooks/use-chapters-live-parsing';
import { DetailsPanelProps } from '../../types';
import './styles.scss';
/**
 * Types
 */
import type React from 'react';

const CHARACTERS_PER_LINE = 31;

/**
 * React component that renders a Video details control
 *
 * @param {DetailsPanelProps} props - Component properties.
 * @returns {React.ReactElement}      Details panel component.
 */
export default function DetailsPanel( {
	filename,
	chapter,
	isAutoGeneratedChapter,
	attributes,
	setAttributes,
	isRequestingVideoData,
	updateError,
}: DetailsPanelProps ) {
	const { title, description } = attributes;
	const { hasIncompleteChapters } = useChaptersLiveParsing( description );

	// Expands the description textarea to accommodate the description
	const minRows = 4;
	const maxRows = 12;
	const rows = description?.length
		? description
				.split( '\n' )
				.map( line => Math.ceil( line.length / CHARACTERS_PER_LINE ) || 1 )
				.reduce( ( sum, current ) => sum + current, 0 )
		: minRows;

	const descriptionControlRows = Math.min( maxRows, Math.max( rows, minRows ) );

	const descriptionHelp = hasIncompleteChapters ? null : <ChaptersLearnMoreHelper />;

	const hasUploadedChapters = !! chapter && ! isAutoGeneratedChapter;

	return (
		<PanelBody title={ __( 'Details', 'jetpack-videopress-pkg' ) }>
			<TextControl
				label={ __( 'Title', 'jetpack-videopress-pkg' ) }
				value={ title }
				placeholder={
					filename?.length ? `${ filename } video` : __( 'Video title', 'jetpack-videopress-pkg' )
				}
				onChange={ value => setAttributes( { title: value } ) }
				disabled={ isRequestingVideoData || !! updateError }
			/>

			<TextareaControl
				label={ __( 'Description', 'jetpack-videopress-pkg' ) }
				value={ description }
				placeholder={ __( 'Video description', 'jetpack-videopress-pkg' ) }
				onChange={ value => setAttributes( { description: value } ) }
				rows={ descriptionControlRows }
				disabled={ isRequestingVideoData || !! updateError }
				help={ descriptionHelp }
			/>

			{ ! hasUploadedChapters && hasIncompleteChapters && (
				<IncompleteChaptersNotice className="incomplete-chapters-notice" />
			) }

			{ hasUploadedChapters && (
				<Notice status="success" className="learn-how-notice" isDismissible={ false }>
					<p className="learn-how-notice__message">
						{ createInterpolateElement(
							__(
								'You already have chapter information on an attached VTT file, so adding chapters to the description will not change the original ones. <link>Learn more</link>',
								'jetpack-videopress-pkg'
							),
							{
								link: (
									<ExternalLink href="https://jetpack.com/support/jetpack-videopress/jetpack-videopress-customizing-your-videos/#adding-subtitles-captions-or-chapters-within-a-video" />
								),
							}
						) }
					</p>
				</Notice>
			) }

			{ !! updateError && (
				<Notice status="error" className="details-panel__error" isDismissible={ false }>
					{ __( 'Error updating the video details.', 'jetpack-videopress-pkg' ) }
				</Notice>
			) }
		</PanelBody>
	);
}
