'use client'

import React from 'react'
import { useWhatsApp } from '../contexts/WhatsAppContext'

const Navbar = () => {
  const { isConnected: whatsappConnected } = useWhatsApp()

  return (
    <nav className='bg-white shadow-lg border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-6 sm:px-8 w-full'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <h1 className='text-2xl font-bold font-mono text-gray-800 hover:text-green-700 cursor-pointer transition-colors'>
              EstateEdge
            </h1>
          </div>

          {/* WhatsApp Connection Indicator */}
          <div
            className={`flex items-center space-x-2 py-1.5 px-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer ${
              whatsappConnected
                ? 'hover:border-green-400'
                : 'hover:border-red-400'
            } transition-all duration-150`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                whatsappConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className='text-sm font-medium text-gray-700 hidden sm:inline'>
              {whatsappConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
