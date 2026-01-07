"use client"

import React, { useState } from "react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Select } from "@/components/Select"
import { Badge } from "@/components/Badge"
import { ProgressBar } from "@/components/ProgressBar"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/Dialog"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose } from "@/components/Drawer"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/Dropdown"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/Popover"
import { RadioCardGroup, RadioCardItem } from "@/components/RadioCard"
import { DatePicker, DateRangePicker } from "@/components/DatePicker"
import { Calendar } from "@/components/Calendar"
import { LineChart } from "@/components/LineChart"
import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard"
import { ChartCard } from "@/components/ui/overview/DashboardChartCard"
import { ProgressBarCard } from "@/components/ui/overview/DashboardProgressBarCard"
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar"
import { KpiEntry, KpiEntryExtended } from "@/app/(main)/overview/page"
import { overviews } from "@/data/overview-data"
import { subDays, toDate } from "date-fns"
import { DateRange } from "react-day-picker"

export default function DesignLibraryPage() {
  const [inputValue, setInputValue] = useState("")
  const [selectValue, setSelectValue] = useState("")
  const [dateValue, setDateValue] = useState<Date>()
  const [dateRangeValue, setDateRangeValue] = useState<DateRange | undefined>()
  const [calendarValue, setCalendarValue] = useState<Date>()
  
  const overviewsDates = overviews.map((item) => toDate(item.date).getTime())
  const maxDate = toDate(Math.max(...overviewsDates))
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: subDays(maxDate, 30),
    to: maxDate,
  })

  const kpiData: KpiEntry[] = [
    { title: "Morning slots", percentage: 78, current: 23, allowed: 30 },
    { title: "Evening slots", percentage: 90, current: 18, allowed: 20 },
    { title: "Weekend slots", percentage: 40, current: 4, allowed: 10 },
  ]

  const kpiDataExtended: KpiEntryExtended[] = [
    { title: "Consultations", percentage: 68, value: "12,500 EGP", color: "bg-primary-600 dark:bg-primary-500" },
    { title: "Procedures", percentage: 22, value: "4,100 EGP", color: "bg-secondary-600 dark:bg-secondary-500" },
    { title: "Products", percentage: 10, value: "1,900 EGP", color: "bg-gray-400 dark:bg-gray-600" },
  ]

  const chartData = [
    { date: "2024-01-01", value: 120, previousValue: 100 },
    { date: "2024-01-02", value: 150, previousValue: 120 },
    { date: "2024-01-03", value: 180, previousValue: 140 },
    { date: "2024-01-04", value: 160, previousValue: 130 },
    { date: "2024-01-05", value: 200, previousValue: 150 },
  ]

  return (
    <div className="space-y-16">
      {/* Intro */}
      <section>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          TabibDesk Design Library
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          A comprehensive showcase of all UI components and layout patterns used in TabibDesk.
          Use this as a reference while building features to ensure consistency.
        </p>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Buttons</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Interactive button component with multiple variants and states.
        </p>
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="light">Light Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button isLoading loadingText="Loading...">Loading State</Button>
            <Button disabled>Disabled Button</Button>
          </div>
        </div>
      </section>

      {/* Form Components */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Form Components</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Input fields, labels, and selects for form building.
        </p>
        <div className="mt-6 max-w-md space-y-6">
          <div>
            <Label htmlFor="text-input">Text Input</Label>
            <Input
              id="text-input"
              type="text"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email-input">Email Input</Label>
            <Input
              id="email-input"
              type="email"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password-input">Password Input</Label>
            <Input
              id="password-input"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="error-input">Input with Error</Label>
            <Input
              id="error-input"
              type="text"
              placeholder="This has an error"
              hasError
            />
            <p className="mt-1 text-sm text-red-600">This field is required</p>
          </div>
          <div>
            <Label htmlFor="select-input">Select</Label>
            <Select 
              id="select-input" 
              value={selectValue} 
              onChange={(e) => setSelectValue(e.target.value)}
            >
              <option value="">Choose an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </Select>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Badges</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Status indicators and labels.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </section>

      {/* Progress Bar */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Progress Bar</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Visual progress indicators.
        </p>
        <div className="mt-6 max-w-md space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>25% Complete</span>
              <span className="text-gray-500">25/100</span>
            </div>
            <ProgressBar value={25} />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>50% Complete</span>
              <span className="text-gray-500">50/100</span>
            </div>
            <ProgressBar value={50} />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>75% Complete</span>
              <span className="text-gray-500">75/100</span>
            </div>
            <ProgressBar value={75} />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>100% Complete</span>
              <span className="text-gray-500">100/100</span>
            </div>
            <ProgressBar value={100} />
          </div>
        </div>
      </section>

      {/* Dialog & Drawer */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Overlays</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Dialog modals and side drawers.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog description that provides context.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dialog content goes here. You can put forms, text, or any other content.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="secondary">Open Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Drawer Title</DrawerTitle>
                <DrawerDescription>
                  This is a drawer that slides in from the side.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drawer content goes here. Drawers are great for forms or detailed information.
                </p>
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="secondary">Close</Button>
                </DrawerClose>
                <Button>Save</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </section>

      {/* Dropdown & Popover */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Dropdowns & Popovers</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Contextual menus and floating content.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Open Dropdown</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Option 1</DropdownMenuItem>
              <DropdownMenuItem>Option 2</DropdownMenuItem>
              <DropdownMenuItem>Option 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <h4 className="font-medium">Popover Title</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This is a popover with custom content.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* Date Pickers */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Date Pickers</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Date selection components and calendars.
        </p>
        <div className="mt-6 max-w-md space-y-6">
          <div>
            <Label htmlFor="date-picker">Date Picker</Label>
            <DatePicker
              id="date-picker"
              value={dateValue}
              onChange={setDateValue}
              placeholder="Select a date"
            />
          </div>
          <div>
            <Label htmlFor="date-range-picker">Date Range Picker</Label>
            <DateRangePicker
              value={dateRangeValue}
              onChange={setDateRangeValue}
              placeholder="Select date range"
            />
          </div>
          <div>
            <Label>Calendar</Label>
            <div className="mt-2 inline-block rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <Calendar
                mode="single"
                selected={calendarValue}
                onSelect={setCalendarValue}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Radio Cards */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Radio Cards</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Selectable card options.
        </p>
        <RadioCardGroup defaultValue="pro" className="mt-6 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <RadioCardItem value="basic">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-gray-50">Basic Plan</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">For small clinics</span>
            </div>
          </RadioCardItem>
          <RadioCardItem value="pro">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-gray-50">Pro Plan</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">For growing practices</span>
            </div>
          </RadioCardItem>
          <RadioCardItem value="enterprise">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-gray-50">Enterprise</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">For large organizations</span>
            </div>
          </RadioCardItem>
        </RadioCardGroup>
      </section>

      {/* Line Chart */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Line Chart</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Data visualization with line charts.
        </p>
        <div className="mt-6 max-w-3xl">
          <LineChart
            className="h-64"
            data={chartData}
            index="date"
            categories={["value", "previousValue"]}
            colors={["blue", "gray"]}
            valueFormatter={(value) => `${value} visits`}
          />
        </div>
      </section>

      {/* Dashboard Cards */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Dashboard Cards</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Pre-built dashboard card patterns from the Tremor template.
        </p>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Progress Bar Card</h3>
          <div className="mt-4 max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <ProgressBarCard
              title="Appointments"
              change="+5.2%"
              value="78%"
              valueDescription="slots booked"
              ctaDescription="Appointment capacity this month."
              ctaText="View calendar."
              ctaLink="/appointments"
              data={kpiData}
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Category Bar Card</h3>
          <div className="mt-4 max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <CategoryBarCard
              title="Revenue"
              change="+3.4%"
              value="18,500 EGP"
              valueDescription="this month"
              subtitle="Revenue breakdown"
              ctaDescription="View detailed breakdown in"
              ctaText="insights."
              ctaLink="/insights"
              data={kpiDataExtended}
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Chart Card</h3>
          <div className="mt-4 max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <ChartCard
              title="Patient Visits"
              type="unit"
              selectedDates={selectedDates}
              selectedPeriod="last-year"
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Filter Bar</h3>
          <div className="mt-4">
            <Filterbar
              maxDate={maxDate}
              minDate={new Date(2023, 0, 1)}
              selectedDates={selectedDates}
              onDatesChange={setSelectedDates}
            />
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Color Palette</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Brand colors used throughout TabibDesk.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Primary (#158ce2)</h3>
            <div className="mt-2 grid grid-cols-5 gap-2">
              <div className="aspect-square rounded bg-primary-50" title="primary-50"></div>
              <div className="aspect-square rounded bg-primary-100" title="primary-100"></div>
              <div className="aspect-square rounded bg-primary-300" title="primary-300"></div>
              <div className="aspect-square rounded bg-primary-500" title="primary-500"></div>
              <div className="aspect-square rounded bg-primary-700" title="primary-700"></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Secondary (#30d4a1)</h3>
            <div className="mt-2 grid grid-cols-5 gap-2">
              <div className="aspect-square rounded bg-secondary-50" title="secondary-50"></div>
              <div className="aspect-square rounded bg-secondary-100" title="secondary-100"></div>
              <div className="aspect-square rounded bg-secondary-300" title="secondary-300"></div>
              <div className="aspect-square rounded bg-secondary-500" title="secondary-500"></div>
              <div className="aspect-square rounded bg-secondary-700" title="secondary-700"></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Accent (#29446b)</h3>
            <div className="mt-2 grid grid-cols-5 gap-2">
              <div className="aspect-square rounded bg-accent-50" title="accent-50"></div>
              <div className="aspect-square rounded bg-accent-100" title="accent-100"></div>
              <div className="aspect-square rounded bg-accent-300" title="accent-300"></div>
              <div className="aspect-square rounded bg-accent-500" title="accent-500"></div>
              <div className="aspect-square rounded bg-accent-700" title="accent-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-gray-200 pt-8 dark:border-gray-800">
        <p className="text-center text-sm text-gray-500">
          This design library is for internal reference only. All components are built with Tremor UI and Tailwind CSS.
        </p>
      </section>
    </div>
  )
}

