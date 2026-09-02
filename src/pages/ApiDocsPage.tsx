import React, { useState } from 'react';
import { Code2, Key, ListFilter, ShieldCheck, Database, FileText, CheckCheck, Copy } from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(key);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      group: 'Authentication Routes (/api/auth)',
      icon: <Key size={18} className="text-teal-600" />,
      items: [
        {
          method: 'POST',
          path: '/api/auth/signup',
          desc: 'Register a new campus user account (student, faculty, or admin)',
          body: `{
  "name": "Jordan Smith",
  "email": "jordan.smith@campus.edu",
  "password": "password123",
  "role": "student",
  "phone": "(555) 012-3456"
}`,
          response: `{
  "message": "Account created successfully",
  "token": "eyJhbGciOi...",
  "user": { "_id": "usr_...", "name": "Jordan Smith", "email": "...", "role": "student" }
}`,
        },
        {
          method: 'POST',
          path: '/api/auth/login',
          desc: 'Authenticate user with email and password, returns JWT token',
          body: `{
  "email": "alex.rivera@campus.edu",
  "password": "password123"
}`,
          response: `{
  "message": "Logged in successfully",
  "token": "eyJhbGciOi...",
  "user": { ... }
}`,
        },
        {
          method: 'GET',
          path: '/api/auth/me',
          desc: 'Get authenticated user profile (Requires Header: Authorization: Bearer <token>)',
          response: `{
  "user": { "_id": "...", "name": "Alex Rivera", "email": "...", "role": "student" }
}`,
        },
        {
          method: 'POST',
          path: '/api/auth/demo-login',
          desc: 'Quick 1-click test login for evaluator (role: "student" | "admin" | "student2")',
          body: `{ "role": "admin" }`,
          response: `{ "token": "...", "user": { ... } }`,
        },
      ],
    },
    {
      group: 'Item Listing Routes (/api/listings)',
      icon: <ListFilter size={18} className="text-blue-600" />,
      items: [
        {
          method: 'GET',
          path: '/api/listings',
          desc: 'Retrieve feed with search, category, status, type, and sort filters',
          queryParams: '?search=AirPods&category=Electronics&type=lost&status=Open&sort=newest',
          response: `{
  "listings": [
    {
      "_id": "lst_02",
      "type": "lost",
      "title": "Apple AirPods Pro Gen 2 in Matte Black Case",
      "description": "...",
      "category": "Electronics",
      "location": "Student Union Lounge",
      "date": "2026-08-30",
      "status": "Open",
      "claimsCount": 0
    }
  ],
  "total": 1
}`,
        },
        {
          method: 'GET',
          path: '/api/listings/:id',
          desc: 'Get full details and contact information for a specific item',
          response: `{
  "listing": {
    "_id": "lst_01",
    "type": "found",
    "title": "Student ID Card - Emily Johnson",
    "contactInfo": { "name": "Alex Rivera", "email": "alex.rivera@campus.edu" },
    ...
  }
}`,
        },
        {
          method: 'POST',
          path: '/api/listings',
          desc: 'Create a new Lost or Found listing (Protected: Bearer Token required)',
          body: `{
  "type": "lost",
  "title": "Stanley Quencher 40oz Tumbler",
  "description": "Matte eucalyptus color with small dent on base",
  "category": "Bottle",
  "location": "Science Hall Room 102",
  "date": "2026-09-01",
  "imageUrl": "https://...",
  "contactInfo": { "name": "Alex", "email": "alex@campus.edu", "phone": "555-0123" }
}`,
          response: `{ "message": "Listing created successfully", "listing": { ... } }`,
        },
        {
          method: 'PATCH',
          path: '/api/listings/:id/status',
          desc: 'Update listing status (Open / Claimed / Resolved) by poster or admin',
          body: `{ "status": "Claimed" }`,
          response: `{ "message": "Listing status updated", "listing": { ... } }`,
        },
        {
          method: 'DELETE',
          path: '/api/listings/:id',
          desc: 'Delete a listing (Protected: owner or admin)',
          response: `{ "message": "Listing deleted successfully" }`,
        },
      ],
    },
    {
      group: 'Claim Flow Routes (/api/claims)',
      icon: <ShieldCheck size={18} className="text-amber-600" />,
      items: [
        {
          method: 'POST',
          path: '/api/claims',
          desc: 'Submit a claim or "This is Mine" verification request to original poster',
          body: `{
  "listingId": "lst_01",
  "message": "Emily is my lab partner! Her card ends in #8841.",
  "proofDetails": "Has a CS faculty sticker on back",
  "claimantPhone": "(555) 018-7744"
}`,
          response: `{ "message": "Claim request submitted successfully. The poster has been notified.", "claim": { ... } }`,
        },
        {
          method: 'GET',
          path: '/api/claims/my-claims',
          desc: 'Get all claims sent by the currently logged-in user',
          response: `{ "claims": [ { "_id": "clm_01", "status": "pending", ... } ] }`,
        },
        {
          method: 'GET',
          path: '/api/claims/received',
          desc: 'Get claims received on posts created by the currently logged-in user',
          response: `{ "claims": [ ... ] }`,
        },
        {
          method: 'PATCH',
          path: '/api/claims/:id/status',
          desc: 'Accept or reject claim (Listing owner or Admin). On accept, listing becomes Claimed!',
          body: `{ "status": "accepted", "responseNote": "Meet at library front desk at 3pm" }`,
          response: `{ "message": "Claim has been accepted.", "claim": { ... }, "listing": { "status": "Claimed" } }`,
        },
      ],
    },
    {
      group: 'Admin & Utility Routes (/api/admin & /api/upload)',
      icon: <Database size={18} className="text-purple-600" />,
      items: [
        {
          method: 'GET',
          path: '/api/admin/stats',
          desc: 'Admin metrics (total listings, open, claimed, resolved, users, claims)',
          response: `{ "stats": { "totalListings": 7, "openCount": 5, "claimedCount": 1, "resolvedCount": 1, "totalUsers": 4 } }`,
        },
        {
          method: 'POST',
          path: '/api/admin/auto-resolve',
          desc: 'Batch auto-resolve all Open posts older than X days (default: 30 days)',
          body: `{ "days": 30 }`,
          response: `{ "message": "Successfully auto-resolved 2 listing(s) older than 30 days.", "resolvedCount": 2 }`,
        },
        {
          method: 'POST',
          path: '/api/upload',
          desc: 'Multer image upload endpoint (multipart/form-data with "image" file)',
          response: `{ "imageUrl": "/uploads/item-1725261234567.jpg", "filename": "item-1725261234567.jpg" }`,
        },
        {
          method: 'POST',
          path: '/api/seed',
          desc: 'Reset all database items to clean campus demo fixtures',
          response: `{ "message": "Database reset to initial campus seed items." }`,
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
          <Code2 size={13} />
          <span>Express Backend API Specification</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">REST API Documentation</h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Comprehensive reference for authentication, listing filters, claim verification workflows, image uploads via Multer, and administrative operations.
        </p>
      </div>

      {/* Endpoints Groups */}
      <div className="space-y-6">
        {endpoints.map((group) => (
          <div key={group.group} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2.5">
              {group.icon}
              <h2 className="text-sm font-bold text-slate-900">{group.group}</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {group.items.map((item, idx) => {
                const itemKey = `${item.method}-${item.path}-${idx}`;
                return (
                  <div key={itemKey} className="p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.method === 'GET'
                              ? 'bg-blue-100 text-blue-800'
                              : item.method === 'POST'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.method === 'PATCH'
                              ? 'bg-amber-100 text-amber-800'
                              : item.method === 'PUT'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.method}
                        </span>
                        <code className="text-xs font-mono font-bold text-slate-900">{item.path}</code>
                        {item.queryParams && (
                          <span className="text-[11px] font-mono text-slate-500">{item.queryParams}</span>
                        )}
                      </div>

                      <button
                        onClick={() => copyToClipboard(`${item.method} ${item.path}`, itemKey)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 p-1 rounded"
                      >
                        {copiedEndpoint === itemKey ? (
                          <>
                            <CheckCheck size={12} className="text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy path</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600">{item.desc}</p>

                    {/* Request Body & Response Code Samples */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {item.body && (
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 block mb-1 uppercase">Request Body</span>
                          <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto">
                            {item.body}
                          </pre>
                        </div>
                      )}
                      {item.response && (
                        <div className={!item.body ? 'md:col-span-2' : ''}>
                          <span className="text-[10px] font-semibold text-slate-500 block mb-1 uppercase">Example Response</span>
                          <pre className="p-2.5 bg-slate-900 text-slate-300 rounded-lg text-[11px] font-mono overflow-x-auto">
                            {item.response}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
