import mockData from '@/mock/data.json'

export const formatDate = (d) => {
  const current = new Date(d)
  const formatDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate() + ' ' + current.getHours() + ':' + current.getMinutes() + ':' + current.getSeconds()
  return formatDate
}
export const formatLevel = (num) => {
  return mockData.LavelList[num]
}
