declare module 'next/navigation' {
  export type Router = {
    push(url: string): void | Promise<void>;
    replace(url: string): void | Promise<void>;
    back(): void;
    refresh?(): void;
    prefetch?(url: string): Promise<void>;
  };

  export function useRouter(): Router;
  export function useParams(): Record<string, string | undefined>;
  export function useSearchParams(): URLSearchParams;
  export function redirect(url: string): never;
  export function usePathname(): string | null;
  export default useRouter;
}
