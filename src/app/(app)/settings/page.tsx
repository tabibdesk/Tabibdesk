"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import {
  RiUserLine,
  RiLockLine,
  RiBellLine,
  RiBuildingLine,
  RiPaletteLine,
} from "@remixicon/react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "clinic" | "security" | "notifications" | "preferences"
  >("profile")

  const tabs = [
    { id: "profile", label: "Profile", icon: RiUserLine },
    { id: "clinic", label: "Clinic", icon: RiBuildingLine },
    { id: "security", label: "Security", icon: RiLockLine },
    { id: "notifications", label: "Notifications", icon: RiBellLine },
    { id: "preferences", label: "Preferences", icon: RiPaletteLine },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your account and clinic preferences
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        activeTab === tab.id
                          ? "bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="size-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue="Dr. Ahmed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue="Hassan" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="dr.ahmed@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue="+20 100 123 4567" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" defaultValue="General Practice" />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="primary">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "clinic" && (
            <Card>
              <CardHeader>
                <CardTitle>Clinic Settings</CardTitle>
                <CardDescription>Manage your clinic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="clinic-name">Clinic Name</Label>
                  <Input id="clinic-name" defaultValue="Hassan Medical Center" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinic-address">Address</Label>
                  <Input id="clinic-address" defaultValue="123 Tahrir St, Cairo, Egypt" />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-phone">Phone</Label>
                    <Input id="clinic-phone" type="tel" defaultValue="+20 2 1234 5678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-email">Email</Label>
                    <Input id="clinic-email" type="email" defaultValue="info@hassanclinic.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="working-hours">Working Hours</Label>
                  <Input id="working-hours" defaultValue="9:00 AM - 5:00 PM" />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="primary">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-50">
                    Password Requirements:
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• At least 8 characters</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="primary">Update Password</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Choose what notifications you&apos;d like to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50">Appointment Reminders</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified about upcoming appointments
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50">New Patient Registrations</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive alerts when new patients register
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50">Lab Results</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when lab results are ready
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50">Follow-up Reminders</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Reminders for patient follow-ups
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="primary">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Customize your TabibDesk experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                  >
                    <option>English</option>
                    <option>العربية</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                  >
                    <option>Africa/Cairo (GMT+2)</option>
                    <option>Asia/Dubai (GMT+4)</option>
                    <option>Europe/London (GMT+0)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <select
                    id="date-format"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-format">Time Format</Label>
                  <select
                    id="time-format"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                  >
                    <option>12-hour (AM/PM)</option>
                    <option>24-hour</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="primary">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
