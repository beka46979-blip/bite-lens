'use server';

import { setLocaleCookie } from './cookies';
import { Locale } from './index';
import { revalidatePath } from 'next/cache';

export async function changeLocaleAction(locale: Locale) {
  await setLocaleCookie(locale);
  revalidatePath('/', 'layout');
}
