import * as React from "react";
import { CardComponent, CardProps } from "@yext/search-ui-react";
import Job from "../types/jobs";

const JobCard: CardComponent<Job> = ({
  result,
}: CardProps<Job>): JSX.Element => {
  const job = result.rawData;

  // function that takes a date in the format YYYY-MM-DD and returns date in the format Month Day, Year
  const formatDate = (date: string): string => {
    if (!date) return "";

    const dateObj = new Date(date);
    const month = dateObj.toLocaleString("default", { month: "long" });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <div className="justify-between border rounded-lg mb-4 p-4 shadow-sm bg-zinc-100 text-stone-900">
      <div className="flex flex-col">
        <div className="text-lg font-semibold text-red-700">{job.name}</div>
        <div>{job.c_jobDepartment}</div>
        <div className="flex gap-1">
          {job.employmentType && (
            <div className="bg-gray-600 rounded text-sm text-gray-100 flex px-1">
              {`${job.employmentType}`}
            </div>
          )}
          {job.c_salary && (
            <div className="bg-gray-600 rounded text-sm text-gray-100 flex px-1">
              {`$${job.c_salary}/hour`}
            </div>
          )}
        </div>
        <div className="py-2 ">{job.description}</div>
        {job.datePosted && (
          <div className="text-sm">{`Date Posted: ${formatDate(
            job.datePosted
          )}`}</div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
