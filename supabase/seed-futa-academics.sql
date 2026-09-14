-- FUTAGO current FUTA academic structure seed
-- Checked against current official FUTA school pages in September 2026.
-- Safe to run more than once.

begin;

insert into public.schools (name, short_name, slug)
values
  ('School of Agriculture and Agricultural Technology', 'SAAT', 'school-agriculture-agricultural-technology'),
  ('School of Earth and Mineral Sciences', 'SEMS', 'school-earth-mineral-sciences'),
  ('School of Environmental Technology', 'SET', 'school-environmental-technology'),
  ('School of Logistics and Innovation Technology', 'SLIT', 'school-logistics-innovation-technology'),
  ('School of Life Sciences', 'SLS', 'school-life-sciences'),
  ('School of Physical Sciences', 'SPS', 'school-physical-sciences'),
  ('School of Computing', 'SOC', 'school-computing'),
  ('School of Infrastructure, Minerals and Manufacturing Engineering', 'SIMME', 'school-infrastructure-minerals-manufacturing-engineering'),
  ('School of Electrical Systems Engineering', 'SESE', 'school-electrical-systems-engineering'),
  ('School of Basic Medical Sciences', 'SBMS', 'school-basic-medical-sciences'),
  ('School of Basic Clinical Sciences', 'SBCS', 'school-basic-clinical-sciences'),
  ('School of Clinical Sciences', 'SCS', 'school-clinical-sciences')
on conflict (short_name) do update
set name = excluded.name,
    slug = excluded.slug;

-- Remove superseded entries previously seeded by FUTAGO.
delete from public.departments
where school_id = (select id from public.schools where short_name = 'SLIT')
  and name in ('Transport Management Technology', 'Library Management Technology');

delete from public.departments
where school_id = (select id from public.schools where short_name = 'SEMS')
  and name in ('Meteorology', 'Remote Sensing and Geoscience Information Systems');

-- SAAT
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Agricultural Extension and Communication Technology', 'AEC', 'agricultural-extension-communication-technology'),
  ('Agricultural and Resource Economics', 'ARE', 'agricultural-resource-economics'),
  ('Animal Production and Health', 'APH', 'animal-production-health'),
  ('Crop, Soil and Pest Management', 'CSP', 'crop-soil-pest-management'),
  ('Ecotourism and Wildlife Management', 'EWM', 'ecotourism-wildlife-management'),
  ('Fisheries and Aquaculture Technology', 'FAT', 'fisheries-aquaculture-technology'),
  ('Food Science and Technology', 'FST', 'food-science-technology'),
  ('Forestry and Wood Technology', 'FWT', 'forestry-wood-technology'),
  ('Nutrition and Dietetics', 'NUD', 'nutrition-dietetics')
) as d(name, short_name, slug)
where s.short_name = 'SAAT'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SEMS
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Applied Geology', 'AGY', 'applied-geology'),
  ('Applied Geophysics', 'AGP', 'applied-geophysics'),
  ('Marine Science and Technology', 'MST', 'marine-science-technology'),
  ('Meteorology and Climate Science', 'MCS', 'meteorology-climate-science'),
  ('Remote Sensing and GIS', 'RSG', 'remote-sensing-gis')
) as d(name, short_name, slug)
where s.short_name = 'SEMS'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SET
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Architecture', 'ARC', 'architecture'),
  ('Building', 'BDT', 'building'),
  ('Estate Management', 'ESM', 'estate-management'),
  ('Industrial Design', 'IDD', 'industrial-design'),
  ('Quantity Surveying', 'QSV', 'quantity-surveying'),
  ('Surveying and Geoinformatics', 'SVG', 'surveying-geoinformatics'),
  ('Urban and Regional Planning', 'URP', 'urban-regional-planning')
) as d(name, short_name, slug)
where s.short_name = 'SET'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SLIT
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Business Information Technology', 'BIT', 'business-information-technology'),
  ('Entrepreneurship Management Technology', 'EMT', 'entrepreneurship-management-technology'),
  ('Project Management Technology', 'PMT', 'project-management-technology'),
  ('Logistics and Transport Technology', 'LTT', 'logistics-transport-technology'),
  ('Securities and Investment Management Technology', 'SIMT', 'securities-investment-management-technology')
) as d(name, short_name, slug)
where s.short_name = 'SLIT'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SLS
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Biochemistry', 'BCH', 'biochemistry'),
  ('Biology', 'BIO', 'biology'),
  ('Biotechnology', 'BTH', 'biotechnology'),
  ('Microbiology', 'MCB', 'microbiology'),
  ('Plant Biology', 'PLB', 'plant-biology'),
  ('Animal and Environmental Biology', 'AEB', 'animal-environmental-biology')
) as d(name, short_name, slug)
where s.short_name = 'SLS'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SPS undergraduate degree departments.
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Chemistry', 'CHE', 'chemistry'),
  ('Mathematics', 'MTS', 'mathematics'),
  ('Physics', 'PHY', 'physics'),
  ('Statistics', 'STA', 'statistics')
) as d(name, short_name, slug)
where s.short_name = 'SPS'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SOC
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Computer Science', 'CSC', 'computer-science'),
  ('Information Technology', 'IFT', 'information-technology'),
  ('Cybersecurity', 'CYS', 'cybersecurity'),
  ('Information Systems', 'IFS', 'information-systems'),
  ('Data Science', 'DSC', 'data-science'),
  ('Software Engineering', 'SEN', 'software-engineering')
) as d(name, short_name, slug)
where s.short_name = 'SOC'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SIMME
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Agricultural Engineering', 'AGE', 'agricultural-engineering'),
  ('Chemical Engineering', 'CME', 'chemical-engineering'),
  ('Civil and Environmental Engineering', 'CVE', 'civil-environmental-engineering'),
  ('Industrial and Production Engineering', 'IPE', 'industrial-production-engineering'),
  ('Mechanical Engineering', 'MEE', 'mechanical-engineering'),
  ('Metallurgical and Materials Engineering', 'MME', 'metallurgical-materials-engineering'),
  ('Mining Engineering', 'MNE', 'mining-engineering')
) as d(name, short_name, slug)
where s.short_name = 'SIMME'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SESE
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Biomedical Engineering', 'BME', 'biomedical-engineering'),
  ('Computer Engineering', 'CPE', 'computer-engineering'),
  ('Electrical and Electronics Engineering', 'EEE', 'electrical-electronics-engineering'),
  ('Information and Communication Engineering', 'ICT', 'information-communication-engineering'),
  ('Mechatronics Engineering', 'MTE', 'mechatronics-engineering')
) as d(name, short_name, slug)
where s.short_name = 'SESE'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SBMS
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Anatomy', 'ANA', 'anatomy'),
  ('Biomedical Technology', 'BMT', 'biomedical-technology'),
  ('Medical Laboratory Science', 'MLS', 'medical-laboratory-science'),
  ('Physiology', 'PHS', 'physiology'),
  ('Public Health', 'PHT', 'public-health'),
  ('Medicine and Surgery', 'MBBS', 'medicine-surgery')
) as d(name, short_name, slug)
where s.short_name = 'SBMS'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SBCS and SCS remain valid FUTA schools inside the College of Health Sciences,
-- but FUTA's current public school pages do not publish a department list for them.
-- FUTAGO therefore does not invent department choices for those schools.

commit;
