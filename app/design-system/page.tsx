"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/Card";

export default function DesignSystem() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-green-50 py-12">
          <div className="container mx-auto max-w-7xl px-6">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Design System
            </h1>
            <p className="text-gray-600 text-lg">
              A showcase of UI components and styles used across the Hyelp platform
            </p>
          </div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-6 py-12">
          {/* Typography */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">Typography</h2>
            
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-5xl font-bold text-gray-800 mb-2">Heading 1</h1>
                <p className="text-gray-500 text-sm">font-display text-5xl font-bold</p>
              </div>
              
              <div>
                <h2 className="font-display text-4xl font-bold text-gray-800 mb-2">Heading 2</h2>
                <p className="text-gray-500 text-sm">font-display text-4xl font-bold</p>
              </div>
              
              <div>
                <h3 className="font-display text-3xl font-bold text-gray-800 mb-2">Heading 3</h3>
                <p className="text-gray-500 text-sm">font-display text-3xl font-bold</p>
              </div>
              
              <div>
                <h4 className="font-display text-2xl font-bold text-gray-800 mb-2">Heading 4</h4>
                <p className="text-gray-500 text-sm">font-display text-2xl font-bold</p>
              </div>
              
              <div>
                <p className="text-lg text-gray-700 mb-2">Large Paragraph</p>
                <p className="text-gray-500 text-sm">text-lg text-gray-700</p>
              </div>
              
              <div>
                <p className="text-base text-gray-700 mb-2">Regular Paragraph</p>
                <p className="text-gray-500 text-sm">text-base text-gray-700</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-700 mb-2">Small Text</p>
                <p className="text-gray-500 text-sm">text-sm text-gray-700</p>
              </div>
            </div>
          </section>
          
          {/* Colors */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">Colors</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Primary Color (Green)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="flex flex-col">
                    <div 
                      className={`h-24 rounded-lg mb-2 bg-green-${shade}`} 
                      style={{ backgroundColor: `var(--green-${shade})` }}
                    ></div>
                    <p className="text-sm font-medium">Green {shade}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-4">Grays</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="flex flex-col">
                    <div 
                      className={`h-24 rounded-lg mb-2 bg-gray-${shade}`} 
                      style={{ backgroundColor: `var(--gray-${shade})` }}
                    ></div>
                    <p className="text-sm font-medium">Gray {shade}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Buttons */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">Buttons</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-4">Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>Default Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="link">Link Button</Button>
                  <Button variant="destructive">Destructive Button</Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-4">Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small Button</Button>
                  <Button size="default">Default Button</Button>
                  <Button size="lg">Large Button</Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-4">States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button isLoading>Loading Button</Button>
                  <Button disabled>Disabled Button</Button>
                  <Button fullWidth>Full Width Button</Button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Cards */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">Cards</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>This is a default card with medium padding</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Cards are containers that group related content and actions. They can contain various components like text, buttons, and images.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
              
              <Card variant="elevated" padding="lg">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>This is an elevated card with large padding</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Elevated cards have a stronger shadow effect, giving them more prominence in the UI.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline">Cancel</Button>
                  <Button size="sm" className="ml-2">Submit</Button>
                </CardFooter>
              </Card>
              
              <Card variant="flat" padding="sm">
                <CardHeader>
                  <CardTitle>Flat Card</CardTitle>
                  <CardDescription>This is a flat card with small padding</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Flat cards have no shadow, just a simple border to define their boundaries.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="ghost">Learn More</Button>
                </CardFooter>
              </Card>
            </div>
          </section>
          
          {/* Form Elements */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">Form Elements</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="example-input" className="block text-gray-700 font-medium mb-2">
                    Text Input
                  </label>
                  <input
                    id="example-input"
                    type="text"
                    placeholder="Enter text here"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="example-select" className="block text-gray-700 font-medium mb-2">
                    Select Menu
                  </label>
                  <select
                    id="example-select"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select an option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="example-textarea" className="block text-gray-700 font-medium mb-2">
                    Textarea
                  </label>
                  <textarea
                    id="example-textarea"
                    placeholder="Enter multiple lines of text"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  ></textarea>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <fieldset>
                    <legend className="text-gray-700 font-medium mb-2">Radio Buttons</legend>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="radio-1"
                          type="radio"
                          name="radio-group"
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="radio-1" className="ml-2 text-gray-700">
                          Option 1
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="radio-2"
                          type="radio"
                          name="radio-group"
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="radio-2" className="ml-2 text-gray-700">
                          Option 2
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                
                <div>
                  <fieldset>
                    <legend className="text-gray-700 font-medium mb-2">Checkboxes</legend>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="checkbox-1"
                          type="checkbox"
                          className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
                        />
                        <label htmlFor="checkbox-1" className="ml-2 text-gray-700">
                          Checkbox 1
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="checkbox-2"
                          type="checkbox"
                          className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
                        />
                        <label htmlFor="checkbox-2" className="ml-2 text-gray-700">
                          Checkbox 2
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Toggle Switch
                  </label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className="ml-3 text-gray-700">Toggle me</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 