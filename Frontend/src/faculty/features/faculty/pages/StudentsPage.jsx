import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { SearchInput } from '../../../components/ui/SearchInput';
import { useStudents } from '../hooks/useStudents';

const StudentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Set status to 'pending' when accessing from /faculty/pending route
  useEffect(() => {
    if (location.pathname === '/faculty/pending') {
      setSelectedStatus('pending');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/faculty/students') {  
      setSelectedStatus('all');
    }
  }, [location.pathname]);

  const filters = useMemo(() => ({
    program: selectedProgram !== 'all' ? selectedProgram : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  }), [selectedProgram, selectedStatus]);

  const { data: students = [], isLoading } = useStudents(filters);

  const displayedStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter((s) => {
      const nameMatch = s.name?.toLowerCase().includes(query);
      const rollMatch = s.rollNumber?.toLowerCase().includes(query);
      return nameMatch || rollMatch;
    });
  }, [students, searchQuery]);

  const columns = useMemo(
    () => [ 
      {
        accessorKey: 'name',
        header: 'Student',
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {row.original.avatar}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-slate-900">{row.original.name}</div>
              <div className="text-sm text-slate-500">{row.original.rollNumber}</div>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'program',
        header: 'Program',
        cell: ({ row }) => (
          <div>
            <div className="text-sm text-slate-900">{row.original.program}</div>
            <div className="text-sm text-slate-500">{row.original.department}</div>
          </div>
        )
      },
      {
        accessorKey: 'semester',
        header: 'Semester',
        cell: ({ getValue }) => (
          <span className="text-sm text-slate-900">Sem {getValue()}</span>
        )
      },
      {
        accessorKey: 'cgpa',
        header: 'CGPA',
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-gray-900">{getValue()}</span>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <Badge status={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        }
      },
      {
        accessorKey: 'submittedDate',
        header: 'Submitted',
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return (
            <span className="text-sm text-gray-500">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          );
        }
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant={row.original.status === 'pending' ? 'primary' : 'ghost'}
            onClick={() => navigate(`/faculty/review/${row.original.id}`)}
          >
            {row.original.status === 'pending' ? 'Review' : 'View'}
          </Button>
        )
      }
    ],
    [navigate]
  );

  const table = useReactTable({
    data: displayedStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  const programs = [
    { value: 'all', label: 'All Programs' },
    { value: 'B.Tech', label: 'B.Tech' },
    { value: 'M.Tech', label: 'M.Tech' },
    { value: 'PhD', label: 'PhD' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assigned Students</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and review submissions from {students.length} students
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <SearchInput
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Program Filter */}
          <div>
            <div className="flex space-x-2">
              {programs.map((program) => (
                <button
                  key={program.value}
                  onClick={() => setSelectedProgram(program.value)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedProgram === program.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {program.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm text-gray-500">No students found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                students.length
              )}{' '}
              of {students.length} results
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentsPage;