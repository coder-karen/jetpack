<?php
/**
 * Sync Spawner.
 *
 * The class is responsible for spawning dedicated Sync requests.
 *
 * @package automattic/jetpack-sync
 */

namespace Automattic\Jetpack\Sync;

use WP_Error;
/**
 * Class to manage Sync spawning.
 * The purpose of this class is to provide the means to unblock Sync from running in the shutdown hook
 * of regular requests by spawning a dedicated Sync request instead which will trigger Sync to run.
 */
class Spawner {

	/**
	 * Check if this request should trigger Sync to run.
	 *
	 * @access public
	 *
	 * @param Automattic\Jetpack\Sync\Queue $queue Queue object.
	 *
	 * @return boolean|WP_Error True if this is a POST request and jetpack_dedicated_sync_request is set, false otherwise, WP_Error if the nonce can't be verified.
	 */
	public static function is_dedicated_sync_request( $queue ) {

		$is_dedicated_sync_request = isset( $_SERVER['REQUEST_METHOD'] ) &&
			'POST' === $_SERVER['REQUEST_METHOD'] &&
			isset( $_POST['jetpack_dedicated_sync_request'] );

		if ( $is_dedicated_sync_request ) {
			$is_valid = isset( $_POST['nonce'] ) &&
				wp_verify_nonce( $_POST['nonce'], 'jetpack_sync_dedicated_request_' . $queue->id );
			if ( ! $is_valid ) {
				return new WP_Error( 'invalid_nonce' );
			}

			return true;
		}

		return false;
	}

	/**
	 * Send a request to run Sync for a certain sync queue
	 * through HTTP request that doesn't halt page loading.
	 *
	 * @access public
	 *
	 * @param Automattic\Jetpack\Sync\Queue $queue Queue object.
	 *
	 * @return boolean|WP_Error True if spawned, WP_Error otherwise.
	 */
	public static function spawn_sync( $queue ) {
		if ( ! Settings::is_sync_spawning_enabled() ) {
			return new WP_Error( 'sync_spawning_disabled', 'Sync spawning is disabled.' );
		}

		if ( $queue->is_locked() ) {
			return new WP_Error( 'locked_queue_' . $queue->id );
		}

		if ( $queue->size() === 0 ) {
			return new WP_Error( 'empty_queue_' . $queue->id );
		}

		$args = array(
			'cookies'   => $_COOKIE,
			'body'      => array(
				'jetpack_dedicated_sync_request' => 1,
				'nonce'                          => wp_create_nonce( 'jetpack_sync_dedicated_request_' . $queue->id ),
			),
			'blocking'  => false,
			'timeout'   => 0.01,
			/** This filter is documented in wp-includes/class-wp-http-streams.php */
			'sslverify' => apply_filters( 'https_local_ssl_verify', false ),
		);

		$result = wp_remote_post( site_url(), $args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return true;
	}

}
