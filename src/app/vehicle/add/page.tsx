import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { addVehicle } from "~/server/actions/add-vehicle";

export default async function AddVehiclePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Add Vehicle</h1>

        <form action={addVehicle} className="space-y-6">
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700"
            >
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              required
              min="1900"
              max={new Date().getFullYear() + 1}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              placeholder="2005"
            />
          </div>

          <div>
            <label
              htmlFor="make"
              className="block text-sm font-medium text-gray-700"
            >
              Make
            </label>
            <input
              type="text"
              id="make"
              name="make"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              placeholder="Subaru"
            />
          </div>

          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700"
            >
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              placeholder="WRX STI"
            />
          </div>

          <div>
            <label
              htmlFor="currentMileage"
              className="block text-sm font-medium text-gray-700"
            >
              Current Mileage
            </label>
            <input
              type="number"
              id="currentMileage"
              name="currentMileage"
              required
              min="0"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              placeholder="45000"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700"
            >
              Add Vehicle
            </button>
            <a
              href="/history"
              className="rounded bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
