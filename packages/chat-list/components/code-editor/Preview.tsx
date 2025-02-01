import React from 'react';

interface IPreviewProps {
  data: string[][];
}
export default function Preview(props: IPreviewProps) {
  const { data } = props;
  if (!data || data.length == 0) return null;

  return (
    <table className="w-full">
      <tbody>
        <tr>
          <td
            key={-1}
            style={{
              height: 26,
              width: 26,
              textAlign: 'center',
              margin: 0,
              padding: 0,
            }}
          ></td>
          {data[0].map((cell, cellIndex) => {
            return (
              <td
                key={cellIndex}
                className="py-1 border-b border-gray-200 bg-gray-200"
                style={{
                  height: 16,
                  margin: 0,
                  padding: 0,
                  textAlign: 'center',
                }}
              >
                {cellIndex + 1}
              </td>
            );
          })}
        </tr>
        {data?.map((row, index) => {
          return (
            <tr key={index} className="border-b border-gray-200">
              <td
                key={-1}
                className="px-2 py-1 border-b border-gray-200 bg-gray-200"
                style={{
                  width: 26,
                  padding: 0,
                  textAlign: 'center',
                }}
              >
                {index + 1}
              </td>
              {row?.map((cell, cellIndex) => {
                return (
                  <td
                    key={cellIndex}
                    className="px-2 py-1 border-b border-gray-200 "
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
