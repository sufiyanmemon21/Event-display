import { Component } from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div
            role="alert"
            className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6 text-center text-card-foreground"
          >
            <h1 className="text-2xl font-semibold">
              Unable to display this page
            </h1>

            <p className="text-sm text-muted-foreground">
              Please check your internet connection and reload the page.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => window.location.reload()}>
                Reload page
              </Button>

              <Button variant="outline" asChild>
                <a href="/">Go to dashboard</a>
              </Button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}