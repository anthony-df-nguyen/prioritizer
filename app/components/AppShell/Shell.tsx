"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import Link from "next/link";
import routes from "@/app/routes";
import { Select } from "../UI/Inputs/Select";
import type { ReactNode } from "react";
import { useProjects } from "@/app/context/ProjectContext";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface ShellProps {
  children: ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { projects, activeProject, setActiveProjectId } = useProjects();
  const pathname = usePathname();

  const normalize = (path: string) =>
    path === "/" ? "/" : path.replace(/\/+$/, "");

  const currentPath = normalize(pathname ?? "/");

  const isRouteActive = (routePath: string) => {
    const normalizedRoute = normalize(routePath);

    if (normalizedRoute === "/") {
      return currentPath === "/";
    }

    return (
      currentPath === normalizedRoute ||
      currentPath.startsWith(`${normalizedRoute}/`)
    );
  };

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="border-b border-gray-200 bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <div className="flex shrink-0 items-center">
                <img
                  alt="Your Company"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                {routes.map((item) => {
                  const active = isRouteActive(item.path);

                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      aria-current={active ? "page" : undefined}
                      className={classNames(
                        active
                          ? "border-indigo-600 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                        "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex items-center gap-2">
                  <div className="text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center  text-sm font-medium">
                    Active Folder
                  </div>
                  <Select<string>
                    label={undefined}
                    value={activeProject?.id ?? projects[0]?.id ?? ""}
                    onChange={(projectId) => {
                      setActiveProjectId(projectId);
                    }}
                    options={projects.map((project) => ({
                      label: project.name,
                      value: project.id,
                      key: project.id,
                    }))}
                    placeholder={projects.length ? "Select a project…" : "No projects"}
                    disabled={!projects.length}
                    className="w-[140px]"
                  />
                </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="block size-6 group-data-open:hidden"
                />
                <XMarkIcon
                  aria-hidden="true"
                  className="hidden size-6 group-data-open:block"
                />
              </DisclosureButton>
            </div>
          </div>
        </div>

        <DisclosurePanel className="sm:hidden">
          <div className="space-y-1 pt-2 pb-3">
            {routes.map((item) => {
              const active = isRouteActive(item.path);

              return (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.path}
                  aria-current={active ? "page" : undefined}
                  className={classNames(
                    active
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                    "block border-l-4 py-2 pr-4 pl-3 text-base font-medium"
                  )}
                >
                  {item.name}
                </DisclosureButton>
              );
            })}
          </div>
        </DisclosurePanel>
      </Disclosure>

      <div className="py-4">
        <main>
          <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
