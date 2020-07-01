/**
 * External dependencies
 */
import classnames from 'classnames';
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { whatsAppURL } from './index';

export default function SendAMessageSave( { attributes, className } ) {
	const {
		countryCode,
		phoneNumber,
		firstMessage,
		buttonText,
		backgroundColor,
		colorClass,
	} = attributes;

	const fullPhoneNumber =
		countryCode && phoneNumber
			? countryCode.replace( /\D+/g, '' ) + phoneNumber.replace( /\D+/g, '' )
			: '';

	const getWhatsAppUrl = () => {
		let url = whatsAppURL + fullPhoneNumber;

		if ( '' !== firstMessage ) {
			url += '&text=' + encodeURIComponent( firstMessage );
		}

		return url;
	};

	const cssClassNames = classnames(
		className,
		colorClass ? 'is-color-' + colorClass : undefined,
		! buttonText.length ? 'has-no-text' : undefined
	);

	return (
		<div className={ cssClassNames }>
			<a
				className="whatsapp-block__button"
				href={ getWhatsAppUrl() }
				style={ { backgroundColor: backgroundColor } }
			>
				<RichText.Content value={ buttonText } />
			</a>
		</div>
	);
}
