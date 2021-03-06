import { DosPlayerFactoryType } from "js-dos";
import { DosInstance } from "emulators-ui/dist/types/js-dos";
import { useEffect, useRef } from "react";

declare const Dos: DosPlayerFactoryType;

export interface IPlayerProps {
    bundleUrl: string;
    onDosInstance?: (dos: DosInstance | null) => void;
}

export function Player(props: IPlayerProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current as HTMLDivElement;
        if (root === null) {
            return;
        }

        const preventListener = (e: any) => {
            let target: HTMLElement | null = e.target as HTMLElement;
            while (target !== null) {
                if (target.className.indexOf("not-prevent-key-events") >= 0) {
                    return;
                }
                target = target.parentElement;
            }
            e.preventDefault();
        };

        window.addEventListener("keydown", preventListener);

        // eslint-disable-next-line new-cap
        const instance = Dos(root, {
            hardware: (window as any).hardware,
            withExperimentalApi: true,
        });

        if (props.onDosInstance) {
            props.onDosInstance(instance);
        }

        instance.run(props.bundleUrl);

        return () => {
            window.removeEventListener("keydown", preventListener);
            instance.stop();
        };
        // eslint-disable-next-line
    }, []);

    return <div ref={rootRef} className="player">
    </div>;
}
