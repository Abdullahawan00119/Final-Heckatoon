import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ for a better community. © 2026 LocalMarket Platform.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:underline underline-offset-4">Terms</a>
            <a href="#" className="hover:underline underline-offset-4">Privacy</a>
            <a href="#" className="hover:underline underline-offset-4">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
