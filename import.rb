require 'yaml'
require 'csv'

def write(filename, hash)
  File.open(filename, 'w') do |f|
    f.write(hash.to_yaml)
    f.write('---')
  end
end

def csv(filename)
  data = []
  headers = []
  CSV.read(filename).each_with_index do |row, index|
    if index == 0
      row.each do |cell|
        headers.push(cell.to_s)
      end
    else
      r = {}
      data.push(r)
      row.each_with_index do |cell, col|
        if /[+-]?(\d+)(\.\d+)/ =~ cell
          r[headers[col]] = cell.to_f
        elsif /[+-]?(\d+)/ =~ cell
          r[headers[col]] = cell.to_i
        elsif cell.to_s != ''
          r[headers[col]] = cell.to_s
        end
      end
    end
  end
  data
end

def plus(hash, group, key, value)
  hash[key] = hash[key] || {}
  hash[key][group] = hash[key][group] || {}
  hash[key][group][value] = (hash[key][group][value] || 0) + 1
  hash[key][group]['total'] = (hash[key][group]['total'] || 0) + 1
end

# Final data hash.
data = {'category' => 'data', 'fata' => {}}

# Import drone aggregates per agency.
csv('_data/fata_drone_aggregates.csv').each do |record|
  data[record['agency']] = data[record['agency']] || {}
  data[record['agency']]['drone'] = record
end

# Import question aggregates per agency.
csv('_data/fata_variables.csv').each do |record|
  data[record['Agency']] = data[record['Agency']] || {}
  record.each do |key,value|
    [data[record['Agency']], data['fata']].each do |scope|
      if /Q\d+/ =~ key
        # agency['data'][key] = agency['data'][key] || {}
        plus(scope, 'All', key, value)

        # Gender
        if record['D1'] == 'Male'
          plus(scope, 'g0', key, value)
        elsif record['D1'] = 'Female'
          plus(scope, 'g1', key, value)
        end

        # Age
        if !record['D2'].is_a? Fixnum
        elsif record['D2'] >= 18 and record['D2'] <= 25
          plus(scope, 'a0', key, value)
        elsif record['D2'] >= 26 and record['D2'] <= 39
          plus(scope, 'a1', key, value)
        elsif record['D2'] >= 40 and record['D2'] <= 54
          plus(scope, 'a2', key, value)
        elsif record['D2'] >= 55
          plus(scope, 'a3', key, value)
        end

        # Years of Education
        if !record['D3'].is_a? Fixnum
        elsif record['D3'] == 0
          plus(scope, 'e0', key, value)
        elsif record['D3'] >= 1 and record['D3'] <= 7
          plus(scope, 'e1', key, value)
        elsif record['D3'] >= 8 and record['D3'] <= 11
          plus(scope, 'e2', key, value)
        elsif record['D3'] >= 12
          plus(scope, 'e3', key, value)
        end

        # Marital status
        if record['D7a'] == 'Married'
          plus(scope, 'm0', key, value)
        elsif record['D7a'] == 'Single' or record['D7a'] == 'Widowed or Divorced'
          plus(scope, 'm1', key, value)
        end

        # Income level
        if ["Rs. 10,001 – 15,000", "Rs. 15,001 or more"].include?(record['D8'])
          plus(scope, 'i0', key, value)
        elsif ["Rs. 1,001 – 3,000", "Rs. 3,001 – 5,000", "Rs. 5,001 – 7,000", "Rs. 7,001 – 10,000"]
          plus(scope, 'i1', key, value)
        end
      end
    end
  end
end

write('_posts/data/0200-01-01-data.txt', data)

