import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';

/**
 * The hostname to announce in the SMTP `EHLO`/`HELO` greeting.
 *
 * Nodemailer otherwise falls back to the machine's local hostname, which inside
 * a container resolves to `[127.0.0.1]`. The relay records that greeting
 * verbatim in the `Received` header, where it travels with the message forever
 * and reads to downstream spam filters as a forged or misconfigured sender. The
 * public webapp URL gives a real, resolvable FQDN instead.
 *
 * Returns `undefined` when the URL has no parseable hostname, which leaves
 * nodemailer on its default behaviour.
 */
export const getSmtpGreetingHostname = (): string | undefined => URL.parse(NEXT_PUBLIC_WEBAPP_URL())?.hostname;
