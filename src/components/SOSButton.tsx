import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Phone, Mic, MapPin, XOctagon } from 'lucide-react';
import { toast } from "sonner";

export function SOSButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [active, setActive] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen && countdown > 0 && !active) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (countdown === 0 && !active) {
            activateSOS();
        }
        return () => clearTimeout(timer);
    }, [isOpen, countdown, active]);

    const activateSOS = () => {
        setActive(true);
        // Simulate Backend API Call
        console.log("SOS ACTIVATED: Sending Location & Audio Stream");
        toast.error("SOS SENT! DO NOT PANIC. HELP IS ON THE WAY.", {
            duration: 10000,
            style: { background: '#ef4444', color: 'white', fontWeight: 'bold' }
        });
    };

    const handleCancel = () => {
        setIsOpen(false);
        setCountdown(5);
        setActive(false);
        toast.info("SOS Cancelled");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="rounded-full w-12 h-12 p-0 shadow-lg animate-pulse hover:animate-none border-4 border-red-600/30">
                    <AlertCircle className="w-6 h-6" />
                    <span className="sr-only">SOS</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-red-500 bg-red-950/90 text-white backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2 text-red-500">
                        <AlertCircle className="w-8 h-8" />
                        EMERGENCY SOS
                    </DialogTitle>
                    <DialogDescription className="text-center text-red-100/80">
                        Using <span className="font-bold">Kazakhstan Emergency Protocol</span>
                    </DialogDescription>
                </DialogHeader>

                {!active ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-red-500 flex items-center justify-center text-6xl font-black tabular-nums animate-ping-slow">
                                {countdown}
                            </div>
                            <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-red-500 animate-ping opacity-30"></div>
                        </div>
                        <p className="text-lg font-medium text-red-200">Sending Alert to 102 & 103...</p>
                        <Button variant="outline" size="lg" className="w-full border-red-400 text-red-500 hover:bg-red-500 hover:text-white" onClick={handleCancel}>
                            <XOctagon className="w-4 h-4 mr-2" />
                            CANCEL SOS
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-6">
                        <div className="flex flex-col gap-4 w-full">
                            <div className="bg-red-900/50 p-4 rounded-lg flex items-center gap-4">
                                <MapPin className="w-6 h-6 text-red-400" />
                                <div>
                                    <p className="font-bold">Live Location Shared</p>
                                    <p className="text-xs text-red-300">Lat: 43.25, Lng: 76.92 (Almaty)</p>
                                </div>
                            </div>
                            <div className="bg-red-900/50 p-4 rounded-lg flex items-center gap-4">
                                <Mic className="w-6 h-6 text-red-400 animate-pulse" />
                                <div>
                                    <p className="font-bold">Audio Recording</p>
                                    <p className="text-xs text-red-300">Transmitting to dispatcher...</p>
                                </div>
                            </div>
                            <div className="bg-red-900/50 p-4 rounded-lg flex items-center gap-4">
                                <Phone className="w-6 h-6 text-red-400" />
                                <div>
                                    <p className="font-bold">Connecting to Dispatcher</p>
                                    <p className="text-xs text-red-300">Estimated wait: 15s</p>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full bg-white text-red-900 hover:bg-gray-200 font-bold" onClick={handleCancel}>
                            I AM SAFE (CLOSE)
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
