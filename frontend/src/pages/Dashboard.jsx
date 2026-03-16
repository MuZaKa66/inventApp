import { useEffect, useState } from 'react';
import { Package, Users, FileText, TrendingUp } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      label: 'Total Products',
      value: '0',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Customers',
      value: '0',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      label: 'Pending Quotations',
      value: '0',
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      label: 'Monthly Sales',
      value: 'PKR 0',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your business today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full btn btn-primary text-left">
              Create New Quotation
            </button>
            <button className="w-full btn btn-secondary text-left">
              Add Product
            </button>
            <button className="w-full btn btn-secondary text-left">
              Add Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
