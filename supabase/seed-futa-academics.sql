-- FUTAGO current FUTA academic structure seed
-- Sources checked against current FUTA school pages in September 2026.
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

-- SAAT
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Agricultural Extension and Communication Technology', 'AEC', 'agricultural-extension-communication-technology'),
  ('Agricultural and Resource Economics', 'ARE', 'agricultural-resource-economics'),
  ('Animal Production and Health', 'APH', 'animal-production-health'),
  ('Crop, Soil and Pest Management', 'CSP', 'crop-soil-pest-management'),
  ('Fisheries and Aquaculture Technology', 'FAT', 'fisheries-aquaculture-technology'),
  ('Ecotourism and Wildlife Management', 'EWM', 'ecotourism-wildlife-management'),
  ('Forestry and Wood Technology', 'FWT', 'forestry-wood-technology'),
  ('Food Science and Technology', 'FST', 'food-science-technology')
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
  ('Applied Geophysics', 'AGP', 'applied-geophysics'),
  ('Applied Geology', 'AGY', 'applied-geology'),
  ('Meteorology', 'MET', 'meteorology'),
  ('Marine Science and Technology', 'MST', 'marine-science-technology'),
  ('Remote Sensing and Geoscience Information Systems', 'RSG', 'remote-sensing-geoscience-information-systems')
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
  ('Building Technology', 'BDG', 'building-technology'),
  ('Estate Management', 'ESM', 'estate-management'),
  ('Industrial Design', 'IDD', 'industrial-design'),
  ('Quantity Surveying', 'QSV', 'quantity-surveying'),
  ('Urban and Regional Planning', 'URP', 'urban-regional-planning'),
  ('Surveying and Geoinformatics', 'SVG', 'surveying-geoinformatics')
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
  ('Project Management Technology', 'PMT', 'project-management-technology'),
  ('Transport Management Technology', 'TMT', 'transport-management-technology'),
  ('Library Management Technology', 'LMT', 'library-management-technology'),
  ('Entrepreneurship Management Technology', 'EMT', 'entrepreneurship-management-technology')
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
  ('Microbiology', 'MCB', 'microbiology'),
  ('Biotechnology', 'BTH', 'biotechnology')
) as d(name, short_name, slug)
where s.short_name = 'SLS'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SPS
insert into public.departments (school_id, name, short_name, slug)
select id, d.name, d.short_name, d.slug
from public.schools s
cross join (values
  ('Chemistry', 'CHE', 'chemistry'),
  ('Mathematical Sciences', 'MTS', 'mathematical-sciences'),
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
  ('Software Engineering', 'SEN', 'software-engineering'),
  ('Data Science', 'DSC', 'data-science')
) as d(name, short_name, slug)
where s.short_name = 'SOC'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SIMME (created from the former SEET structure)
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
  ('Electrical and Electronics Engineering', 'EEE', 'electrical-electronics-engineering'),
  ('Computer Engineering', 'CPE', 'computer-engineering'),
  ('Information and Communication Technology Engineering', 'ICT', 'information-communication-technology-engineering'),
  ('Biomedical Engineering', 'BME', 'biomedical-engineering'),
  ('Mechatronics Engineering', 'MTE', 'mechatronics-engineering')
) as d(name, short_name, slug)
where s.short_name = 'SESE'
on conflict (school_id, name) do update
set short_name = excluded.short_name,
    slug = excluded.slug;

-- SBMS undergraduate programmes/departments listed by FUTA
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

commit;
