export function getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ').map((cookie) => cookie.split('='));
    const foundCookie = cookies.find(([key]) => key === name);
    return foundCookie ? decodeURIComponent(foundCookie[1]) : null;
}
