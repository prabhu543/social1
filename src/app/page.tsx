import React from 'react'
import Home from '@/frontend/home/Home'

const page = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        <Home></Home>
      </div>
      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        {/* <WhoToFollow /> */}
      </div>
    </div>
  )
}

export default page
