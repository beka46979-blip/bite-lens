import { getLocaleFromCookie } from './i18n/cookies';
import { LocalizedLandingPage } from "./components/LocalizedLandingPage";

export default async function Home() {
  const locale = await getLocaleFromCookie();
  return <LocalizedLandingPage locale={locale} />;
}
