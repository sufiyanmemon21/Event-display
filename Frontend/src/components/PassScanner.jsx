import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PassScanner() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  function scan(event) {
    event.preventDefault();
    const input = value.trim();
    let token = input;
    try {
      if (input.includes("://")) token = new URL(input).hash.slice(1);
      if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) throw new Error();
      navigate(`/passes/verify#${token}`);
    } catch {
      setError("Scan a valid EventSphere pass URL or token.");
    }
  }
  return (
    <form onSubmit={scan} className="space-y-3 rounded-xl border bg-card p-5">
      <Label htmlFor="pass-scan">Ticket check-in</Label>
      <p className="text-sm text-muted-foreground">Scan the pass QR with your phone camera while signed in, or enter its URL from a scanner below. Confirmed tickets can check in on the event date.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input id="pass-scan" value={value} onChange={event => { setValue(event.target.value); setError(""); }} placeholder="Scan or paste a pass URL" autoComplete="off" required />
        <Button type="submit">Verify & check in</Button>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
