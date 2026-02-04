import Table from "./Table";

export default function EC2Table({ data }) {
    return (

        <div className="mb-10">

            <h2 className="text-xl text-center font-semibold text-gray-700 mb-4 ">
                EC2 Instances
            </h2>

            <Table
                headers={[
                    "Instance ID",
                    "Instance Type",
                    "State",
                    "Region",
                    "Public IP",
                    "Security Groups",
                ]}
                data={data.map((instance) => [
                    instance.instanceId,
                    instance.instanceType,
                    instance.state,
                    instance.region,
                    instance.publicIp || "-",
                    instance.securityGroups?.join(", ") || "-",
                ])}
            />
        </div>

    );
}
