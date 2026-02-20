import { useState, useEffect, useRef } from 'react'
import client from '../../api/client'

const COUNTRIES = [
  { name: 'Afghanistan', iso_numeric: 4 },
  { name: 'Albania', iso_numeric: 8 },
  { name: 'Algeria', iso_numeric: 12 },
  { name: 'Andorra', iso_numeric: 20 },
  { name: 'Angola', iso_numeric: 24 },
  { name: 'Antigua and Barbuda', iso_numeric: 28 },
  { name: 'Argentina', iso_numeric: 32 },
  { name: 'Armenia', iso_numeric: 51 },
  { name: 'Australia', iso_numeric: 36 },
  { name: 'Austria', iso_numeric: 40 },
  { name: 'Azerbaijan', iso_numeric: 31 },
  { name: 'Bahamas', iso_numeric: 44 },
  { name: 'Bahrain', iso_numeric: 48 },
  { name: 'Bangladesh', iso_numeric: 50 },
  { name: 'Barbados', iso_numeric: 52 },
  { name: 'Belarus', iso_numeric: 112 },
  { name: 'Belgium', iso_numeric: 56 },
  { name: 'Belize', iso_numeric: 84 },
  { name: 'Benin', iso_numeric: 204 },
  { name: 'Bhutan', iso_numeric: 64 },
  { name: 'Bolivia', iso_numeric: 68 },
  { name: 'Bosnia and Herzegovina', iso_numeric: 70 },
  { name: 'Botswana', iso_numeric: 72 },
  { name: 'Brazil', iso_numeric: 76 },
  { name: 'Brunei', iso_numeric: 96 },
  { name: 'Bulgaria', iso_numeric: 100 },
  { name: 'Burkina Faso', iso_numeric: 854 },
  { name: 'Burundi', iso_numeric: 108 },
  { name: 'Cabo Verde', iso_numeric: 132 },
  { name: 'Cambodia', iso_numeric: 116 },
  { name: 'Cameroon', iso_numeric: 120 },
  { name: 'Canada', iso_numeric: 124 },
  { name: 'Central African Republic', iso_numeric: 140 },
  { name: 'Chad', iso_numeric: 148 },
  { name: 'Chile', iso_numeric: 152 },
  { name: 'China', iso_numeric: 156 },
  { name: 'Colombia', iso_numeric: 170 },
  { name: 'Comoros', iso_numeric: 174 },
  { name: 'Congo (Republic)', iso_numeric: 178 },
  { name: 'Congo (Democratic Republic)', iso_numeric: 180 },
  { name: 'Costa Rica', iso_numeric: 188 },
  { name: "Côte d'Ivoire", iso_numeric: 384 },
  { name: 'Croatia', iso_numeric: 191 },
  { name: 'Cuba', iso_numeric: 192 },
  { name: 'Cyprus', iso_numeric: 196 },
  { name: 'Czech Republic', iso_numeric: 203 },
  { name: 'Denmark', iso_numeric: 208 },
  { name: 'Djibouti', iso_numeric: 262 },
  { name: 'Dominica', iso_numeric: 212 },
  { name: 'Dominican Republic', iso_numeric: 214 },
  { name: 'Ecuador', iso_numeric: 218 },
  { name: 'Egypt', iso_numeric: 818 },
  { name: 'El Salvador', iso_numeric: 222 },
  { name: 'Equatorial Guinea', iso_numeric: 226 },
  { name: 'Eritrea', iso_numeric: 232 },
  { name: 'Estonia', iso_numeric: 233 },
  { name: 'Eswatini', iso_numeric: 748 },
  { name: 'Ethiopia', iso_numeric: 231 },
  { name: 'Fiji', iso_numeric: 242 },
  { name: 'Finland', iso_numeric: 246 },
  { name: 'France', iso_numeric: 250 },
  { name: 'Gabon', iso_numeric: 266 },
  { name: 'Gambia', iso_numeric: 270 },
  { name: 'Georgia', iso_numeric: 268 },
  { name: 'Germany', iso_numeric: 276 },
  { name: 'Ghana', iso_numeric: 288 },
  { name: 'Greece', iso_numeric: 300 },
  { name: 'Grenada', iso_numeric: 308 },
  { name: 'Guatemala', iso_numeric: 320 },
  { name: 'Guinea', iso_numeric: 324 },
  { name: 'Guinea-Bissau', iso_numeric: 624 },
  { name: 'Guyana', iso_numeric: 328 },
  { name: 'Haiti', iso_numeric: 332 },
  { name: 'Honduras', iso_numeric: 340 },
  { name: 'Hungary', iso_numeric: 348 },
  { name: 'Iceland', iso_numeric: 352 },
  { name: 'India', iso_numeric: 356 },
  { name: 'Indonesia', iso_numeric: 360 },
  { name: 'Iran', iso_numeric: 364 },
  { name: 'Iraq', iso_numeric: 368 },
  { name: 'Ireland', iso_numeric: 372 },
  { name: 'Israel', iso_numeric: 376 },
  { name: 'Italy', iso_numeric: 380 },
  { name: 'Jamaica', iso_numeric: 388 },
  { name: 'Japan', iso_numeric: 392 },
  { name: 'Jordan', iso_numeric: 400 },
  { name: 'Kazakhstan', iso_numeric: 398 },
  { name: 'Kenya', iso_numeric: 404 },
  { name: 'Kiribati', iso_numeric: 296 },
  { name: 'Kuwait', iso_numeric: 414 },
  { name: 'Kyrgyzstan', iso_numeric: 417 },
  { name: 'Laos', iso_numeric: 418 },
  { name: 'Latvia', iso_numeric: 428 },
  { name: 'Lebanon', iso_numeric: 422 },
  { name: 'Lesotho', iso_numeric: 426 },
  { name: 'Liberia', iso_numeric: 430 },
  { name: 'Libya', iso_numeric: 434 },
  { name: 'Liechtenstein', iso_numeric: 438 },
  { name: 'Lithuania', iso_numeric: 440 },
  { name: 'Luxembourg', iso_numeric: 442 },
  { name: 'Madagascar', iso_numeric: 450 },
  { name: 'Malawi', iso_numeric: 454 },
  { name: 'Malaysia', iso_numeric: 458 },
  { name: 'Maldives', iso_numeric: 462 },
  { name: 'Mali', iso_numeric: 466 },
  { name: 'Malta', iso_numeric: 470 },
  { name: 'Marshall Islands', iso_numeric: 584 },
  { name: 'Mauritania', iso_numeric: 478 },
  { name: 'Mauritius', iso_numeric: 480 },
  { name: 'Mexico', iso_numeric: 484 },
  { name: 'Micronesia', iso_numeric: 583 },
  { name: 'Moldova', iso_numeric: 498 },
  { name: 'Monaco', iso_numeric: 492 },
  { name: 'Mongolia', iso_numeric: 496 },
  { name: 'Montenegro', iso_numeric: 499 },
  { name: 'Morocco', iso_numeric: 504 },
  { name: 'Mozambique', iso_numeric: 508 },
  { name: 'Myanmar', iso_numeric: 104 },
  { name: 'Namibia', iso_numeric: 516 },
  { name: 'Nauru', iso_numeric: 520 },
  { name: 'Nepal', iso_numeric: 524 },
  { name: 'Netherlands', iso_numeric: 528 },
  { name: 'New Zealand', iso_numeric: 554 },
  { name: 'Nicaragua', iso_numeric: 558 },
  { name: 'Niger', iso_numeric: 562 },
  { name: 'Nigeria', iso_numeric: 566 },
  { name: 'North Korea', iso_numeric: 408 },
  { name: 'North Macedonia', iso_numeric: 807 },
  { name: 'Norway', iso_numeric: 578 },
  { name: 'Oman', iso_numeric: 512 },
  { name: 'Pakistan', iso_numeric: 586 },
  { name: 'Palau', iso_numeric: 585 },
  { name: 'Palestine', iso_numeric: 275 },
  { name: 'Panama', iso_numeric: 591 },
  { name: 'Papua New Guinea', iso_numeric: 598 },
  { name: 'Paraguay', iso_numeric: 600 },
  { name: 'Peru', iso_numeric: 604 },
  { name: 'Philippines', iso_numeric: 608 },
  { name: 'Poland', iso_numeric: 616 },
  { name: 'Portugal', iso_numeric: 620 },
  { name: 'Qatar', iso_numeric: 634 },
  { name: 'Romania', iso_numeric: 642 },
  { name: 'Russia', iso_numeric: 643 },
  { name: 'Rwanda', iso_numeric: 646 },
  { name: 'Saint Kitts and Nevis', iso_numeric: 659 },
  { name: 'Saint Lucia', iso_numeric: 662 },
  { name: 'Saint Vincent and the Grenadines', iso_numeric: 670 },
  { name: 'Samoa', iso_numeric: 882 },
  { name: 'San Marino', iso_numeric: 674 },
  { name: 'São Tomé and Príncipe', iso_numeric: 678 },
  { name: 'Saudi Arabia', iso_numeric: 682 },
  { name: 'Senegal', iso_numeric: 686 },
  { name: 'Serbia', iso_numeric: 688 },
  { name: 'Seychelles', iso_numeric: 690 },
  { name: 'Sierra Leone', iso_numeric: 694 },
  { name: 'Singapore', iso_numeric: 702 },
  { name: 'Slovakia', iso_numeric: 703 },
  { name: 'Slovenia', iso_numeric: 705 },
  { name: 'Solomon Islands', iso_numeric: 90 },
  { name: 'Somalia', iso_numeric: 706 },
  { name: 'South Africa', iso_numeric: 710 },
  { name: 'South Korea', iso_numeric: 410 },
  { name: 'South Sudan', iso_numeric: 728 },
  { name: 'Spain', iso_numeric: 724 },
  { name: 'Sri Lanka', iso_numeric: 144 },
  { name: 'Sudan', iso_numeric: 729 },
  { name: 'Suriname', iso_numeric: 740 },
  { name: 'Sweden', iso_numeric: 752 },
  { name: 'Switzerland', iso_numeric: 756 },
  { name: 'Syria', iso_numeric: 760 },
  { name: 'Taiwan', iso_numeric: 158 },
  { name: 'Tajikistan', iso_numeric: 762 },
  { name: 'Tanzania', iso_numeric: 834 },
  { name: 'Thailand', iso_numeric: 764 },
  { name: 'Timor-Leste', iso_numeric: 626 },
  { name: 'Togo', iso_numeric: 768 },
  { name: 'Tonga', iso_numeric: 776 },
  { name: 'Trinidad and Tobago', iso_numeric: 780 },
  { name: 'Tunisia', iso_numeric: 788 },
  { name: 'Turkey', iso_numeric: 792 },
  { name: 'Turkmenistan', iso_numeric: 795 },
  { name: 'Tuvalu', iso_numeric: 798 },
  { name: 'Uganda', iso_numeric: 800 },
  { name: 'Ukraine', iso_numeric: 804 },
  { name: 'United Arab Emirates', iso_numeric: 784 },
  { name: 'United Kingdom', iso_numeric: 826 },
  { name: 'United States', iso_numeric: 840 },
  { name: 'Uruguay', iso_numeric: 858 },
  { name: 'Uzbekistan', iso_numeric: 860 },
  { name: 'Vanuatu', iso_numeric: 548 },
  { name: 'Vatican City', iso_numeric: 336 },
  { name: 'Venezuela', iso_numeric: 862 },
  { name: 'Vietnam', iso_numeric: 704 },
  { name: 'Yemen', iso_numeric: 887 },
  { name: 'Zambia', iso_numeric: 894 },
  { name: 'Zimbabwe', iso_numeric: 716 },
]

export default function TravelSettings() {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)
  const comboRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (comboRef.current && !comboRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = query.trim() === ''
    ? COUNTRIES
    : COUNTRIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    client
      .get('/admin/travels')
      .then((res) => setCountries(res.data))
      .catch(() => setError('Failed to load visited countries.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleRemove(id) {
    if (!confirm('Remove this country?')) return
    try {
      await client.delete(`/admin/travels/${id}`)
      setCountries((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert('Failed to remove country.')
    }
  }

  async function handleAdd() {
    if (!selected) return
    const country = selected
    try {
      const res = await client.post('/admin/travels', {
        name: country.name,
        iso_numeric: country.iso_numeric,
      })
      setCountries((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
    } catch (err) {
      if (err.response?.status === 409) {
        alert('That country is already added.')
      } else {
        alert('Failed to add country.')
      }
    }
  }

  if (loading) return <p className="text-gray-400">Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Visited Countries
        </h3>
        {countries.length === 0 ? (
          <p className="text-gray-500 text-sm">No countries added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => (
              <span key={c.id} className="flex items-center gap-1.5 bg-gray-100 rounded-full pl-3 pr-2 py-1 text-sm">
                {c.name}
                <button
                  onClick={() => handleRemove(c.id)}
                  className="text-gray-400 hover:text-red-500 leading-none"
                  aria-label={`Remove ${c.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Add a Country
        </h3>
        <div className="flex items-center gap-3">
          <div ref={comboRef} className="relative flex-1">
            <input
              type="text"
              value={query}
              placeholder="Search countries…"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              onChange={e => { setQuery(e.target.value); setSelected(null); setOpen(true) }}
              onFocus={() => setOpen(true)}
            />
            {open && filtered.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-md max-h-60 overflow-y-auto text-sm">
                {filtered.map(c => (
                  <li
                    key={c.iso_numeric}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                    onMouseDown={() => { setSelected(c); setQuery(c.name); setOpen(false) }}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!selected}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
